package com.teefi.service.impl;

import com.teefi.dto.request.CheckoutRequest;
import com.teefi.dto.response.OrderItemResponse;
import com.teefi.dto.response.OrderResponse;
import com.teefi.dto.response.PaymentInitResponse;
import com.teefi.entity.*;
import com.teefi.enums.OrderStatus;
import com.teefi.exception.BadRequestException;
import com.teefi.exception.ResourceNotFoundException;
import com.teefi.integration.payment.PaymentService;
import com.teefi.kafka.KafkaEvents;
import com.teefi.kafka.KafkaProducer;
import com.teefi.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;
    private final KafkaProducer kafkaProducer;
    private final CartService cartService;

    private final AtomicLong orderCounter = new AtomicLong(1);

    @Transactional
    public PaymentInitResponse checkout(String email, CheckoutRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout with an empty cart");
        }

        Address address = user.getAddresses().stream()
                .filter(a -> a.getId().equals(request.getAddressId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Address", request.getAddressId()));

        // Build order items from cart
        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            ProductVariant v = cartItem.getVariant();
            BigDecimal lineTotal = v.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            return OrderItem.builder()
                    .productName(v.getProduct().getName())
                    .movieTitle(v.getProduct().getMovieTitle())
                    .thumbnailUrl(v.getProduct().getThumbnailUrl())
                    .variantSize(v.getSize())
                    .variantColor(v.getColor())
                    .unitPrice(v.getPrice())
                    .quantity(cartItem.getQuantity())
                    .lineTotal(lineTotal)
                    .printfulVariantId(v.getPrintfulVariantId())
                    .s3ArtworkKey(v.getProduct().getS3ArtworkKey())
                    .build();
        }).toList();

        BigDecimal subtotal = orderItems.stream()
                .map(OrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shipping = BigDecimal.valueOf(99); // flat rate, can be dynamic later
        BigDecimal total = subtotal.add(shipping);

        Order order = Order.builder()
                .user(user)
                .orderNumber(generateOrderNumber())
                .status(OrderStatus.PAYMENT_INITIATED)
                .items(orderItems)
                .subtotal(subtotal)
                .shippingCost(shipping)
                .totalAmount(total)
                .paymentProvider(request.getPaymentProvider())
                .shippingFullName(address.getFullName())
                .shippingLine1(address.getLine1())
                .shippingLine2(address.getLine2())
                .shippingCity(address.getCity())
                .shippingState(address.getState())
                .shippingPincode(address.getPincode())
                .shippingCountry(address.getCountry())
                .shippingPhone(address.getPhone())
                .notes(request.getNotes())
                .build();

        orderItems.forEach(item -> item.setOrder(order));
        orderRepository.save(order);

        log.info("Order created: {} for user {}", order.getOrderNumber(), email);

        // Initiate payment
        PaymentInitResponse paymentResponse = switch (request.getPaymentProvider()) {
            case RAZORPAY -> paymentService.initiateRazorpay(order);
            case STRIPE   -> paymentService.initiateStripe(order);
        };

        // Save payment order reference
        order.setPaymentOrderId(paymentResponse.getPaymentOrderId());
        orderRepository.save(order);

        // Publish ORDER_CREATED event for notification
        kafkaProducer.sendOrderCreated(KafkaEvents.OrderCreatedEvent.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userFullName(user.getFullName())
                .totalAmount(order.getTotalAmount())
                .occurredAt(LocalDateTime.now())
                .build());

        return paymentResponse;
    }

    /**
     * Called after payment is verified (via webhook or frontend callback).
     * Idempotent — safe to call multiple times with the same paymentId.
     */
    @Transactional
    public void confirmPayment(String paymentOrderId, String paymentId) {
        Order order = orderRepository.findByPaymentOrderId(paymentOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for paymentOrderId: " + paymentOrderId));

        if (order.getStatus() == OrderStatus.PAID || order.getStatus().ordinal() > OrderStatus.PAID.ordinal()) {
            log.info("Order {} already paid — skipping duplicate confirmation", order.getOrderNumber());
            return;
        }

        order.setStatus(OrderStatus.PAID);
        order.setPaymentId(paymentId);
        orderRepository.save(order);

        // Clear the user's cart
        cartService.clearCart(order.getUser().getEmail());

        // Publish ORDER_PAID event — pod-service will pick this up
        kafkaProducer.sendOrderPaid(KafkaEvents.OrderPaidEvent.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .paymentId(paymentId)
                .paymentProvider(order.getPaymentProvider())
                .amountPaid(order.getTotalAmount())
                .shippingFullName(order.getShippingFullName())
                .shippingLine1(order.getShippingLine1())
                .shippingLine2(order.getShippingLine2())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingPincode(order.getShippingPincode())
                .shippingCountry(order.getShippingCountry())
                .shippingPhone(order.getShippingPhone())
                .items(order.getItems().stream().map(i -> KafkaEvents.OrderItemInfo.builder()
                        .printfulVariantId(i.getPrintfulVariantId())
                        .s3ArtworkKey(i.getS3ArtworkKey())
                        .quantity(i.getQuantity())
                        .productName(i.getProductName())
                        .build()).toList())
                .occurredAt(LocalDateTime.now())
                .build());

        log.info("Order {} confirmed as PAID", order.getOrderNumber());
    }

    @Transactional
    public void updateShipping(String podOrderId, String trackingNumber, String trackingUrl, String carrier) {
        Order order = orderRepository.findByPodOrderId(podOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for podOrderId: " + podOrderId));

        order.setStatus(OrderStatus.SHIPPED);
        order.setTrackingNumber(trackingNumber);
        order.setTrackingUrl(trackingUrl);
        order.setShippingCarrier(carrier);
        orderRepository.save(order);

        kafkaProducer.sendPodShipped(KafkaEvents.PodShippedEvent.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .podOrderId(podOrderId)
                .trackingNumber(trackingNumber)
                .trackingUrl(trackingUrl)
                .carrier(carrier)
                .occurredAt(LocalDateTime.now())
                .build());
    }

    public Page<OrderResponse> getUserOrders(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public OrderResponse getOrderByNumber(String orderNumber, String email) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderNumber));
        if (!order.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Order", orderNumber);
        }
        return toResponse(order);
    }

    public Page<OrderResponse> getAllOrders(int page, int size) {
        return orderRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(this::toResponse);
    }

    private String generateOrderNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "TF-" + datePart + "-" + String.format("%05d", orderCounter.getAndIncrement());
    }

    private OrderResponse toResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus())
                .items(o.getItems().stream().map(i -> OrderItemResponse.builder()
                        .productName(i.getProductName())
                        .movieTitle(i.getMovieTitle())
                        .thumbnailUrl(i.getThumbnailUrl())
                        .variantSize(i.getVariantSize())
                        .variantColor(i.getVariantColor())
                        .unitPrice(i.getUnitPrice())
                        .quantity(i.getQuantity())
                        .lineTotal(i.getLineTotal())
                        .build()).toList())
                .subtotal(o.getSubtotal())
                .shippingCost(o.getShippingCost())
                .totalAmount(o.getTotalAmount())
                .paymentProvider(o.getPaymentProvider())
                .paymentId(o.getPaymentId())
                .trackingNumber(o.getTrackingNumber())
                .trackingUrl(o.getTrackingUrl())
                .shippingCarrier(o.getShippingCarrier())
                .shippingFullName(o.getShippingFullName())
                .shippingLine1(o.getShippingLine1())
                .shippingCity(o.getShippingCity())
                .shippingState(o.getShippingState())
                .shippingPincode(o.getShippingPincode())
                .shippingCountry(o.getShippingCountry())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
