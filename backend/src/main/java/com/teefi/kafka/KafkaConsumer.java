package com.teefi.kafka;

import com.teefi.config.KafkaConfig;
import com.teefi.entity.Order;
import com.teefi.enums.OrderStatus;
import com.teefi.integration.printful.PrintfulService;
import com.teefi.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumer {

    private final PrintfulService printfulService;
    private final OrderRepository orderRepository;

    /**
     * When order is paid → submit to Printful automatically.
     */
    @KafkaListener(topics = KafkaConfig.ORDER_PAID, groupId = "pod-group")
    public void handleOrderPaid(@Payload KafkaEvents.OrderPaidEvent event,
                                @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        log.info("Received ORDER_PAID event for order: {}", event.getOrderNumber());
        try {
            // Idempotency check — if already sent to POD, skip
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            if (order.getPodOrderId() != null) {
                log.info("Order {} already submitted to POD, skipping", event.getOrderNumber());
                return;
            }

            // Submit to Printful
            PrintfulService.PrintfulOrderResponse response = printfulService.createOrder(event);

            if (response != null && response.getResult() != null) {
                order.setStatus(OrderStatus.SENT_TO_POD);
                order.setPodOrderId(response.getResult().getId().toString());
                orderRepository.save(order);
                log.info("Order {} submitted to Printful. POD order ID: {}",
                        event.getOrderNumber(), response.getResult().getId());
            }
        } catch (Exception e) {
            log.error("Failed to process ORDER_PAID for {}: {}", event.getOrderNumber(), e.getMessage(), e);
            // In production, push to DLQ (Dead Letter Queue) here
        }
    }

    /**
     * When order is shipped via Printful webhook → update order status.
     */
    @KafkaListener(topics = KafkaConfig.POD_SHIPPED, groupId = "notification-group")
    public void handlePodShipped(@Payload KafkaEvents.PodShippedEvent event) {
        log.info("Received POD_SHIPPED event for order: {} — tracking: {}",
                event.getOrderNumber(), event.getTrackingNumber());
        // Notification logic handled by NotificationService listener
    }

    /**
     * Send email notifications.
     */
    @KafkaListener(topics = KafkaConfig.NOTIFY_EMAIL, groupId = "email-group")
    public void handleEmailNotification(@Payload KafkaEvents.EmailNotificationEvent event) {
        log.info("Processing email notification to: {} subject: {}", event.getTo(), event.getSubject());
        // NotificationService handles actual sending
    }
}
