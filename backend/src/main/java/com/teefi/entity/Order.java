package com.teefi.entity;

import com.teefi.enums.OrderStatus;
import com.teefi.enums.PaymentProvider;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String orderNumber; // e.g. TF-2024-00001

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    // Snapshot of shipping address
    private String shippingFullName;
    private String shippingLine1;
    private String shippingLine2;
    private String shippingCity;
    private String shippingState;
    private String shippingPincode;
    private String shippingCountry;
    private String shippingPhone;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    // Payment info
    @Enumerated(EnumType.STRING)
    private PaymentProvider paymentProvider;
    private String paymentId;          // Razorpay payment_id / Stripe charge_id
    private String paymentOrderId;     // Razorpay order_id / Stripe payment_intent_id

    // Printful fulfillment
    private String podOrderId;
    private String trackingNumber;
    private String trackingUrl;
    private String shippingCarrier;

    private String notes;
}
