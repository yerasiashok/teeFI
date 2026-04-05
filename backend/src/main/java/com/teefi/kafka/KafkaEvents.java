package com.teefi.kafka;

import com.teefi.enums.PaymentProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class KafkaEvents {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderCreatedEvent {
        private UUID orderId;
        private String orderNumber;
        private UUID userId;
        private String userEmail;
        private String userFullName;
        private BigDecimal totalAmount;
        private LocalDateTime occurredAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderPaidEvent {
        private UUID orderId;
        private String orderNumber;
        private UUID userId;
        private String userEmail;
        private String paymentId;
        private PaymentProvider paymentProvider;
        private BigDecimal amountPaid;
        private LocalDateTime occurredAt;
        // Shipping info for Printful
        private String shippingFullName;
        private String shippingLine1;
        private String shippingLine2;
        private String shippingCity;
        private String shippingState;
        private String shippingPincode;
        private String shippingCountry;
        private String shippingPhone;
        private List<OrderItemInfo> items;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemInfo {
        private String printfulVariantId;
        private String s3ArtworkKey;
        private int quantity;
        private String productName;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PodShippedEvent {
        private UUID orderId;
        private String orderNumber;
        private String podOrderId;
        private String trackingNumber;
        private String trackingUrl;
        private String carrier;
        private LocalDateTime occurredAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EmailNotificationEvent {
        private String to;
        private String subject;
        private String templateName;
        private Object templateData;
        private LocalDateTime occurredAt;
    }
}
