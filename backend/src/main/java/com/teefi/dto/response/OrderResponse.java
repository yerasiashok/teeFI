package com.teefi.dto.response;
import com.teefi.enums.OrderStatus;
import com.teefi.enums.PaymentProvider;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Data @Builder
public class OrderResponse {
    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private PaymentProvider paymentProvider;
    private String paymentId;
    private String trackingNumber;
    private String trackingUrl;
    private String shippingCarrier;
    private String shippingFullName;
    private String shippingLine1;
    private String shippingCity;
    private String shippingState;
    private String shippingPincode;
    private String shippingCountry;
    private LocalDateTime createdAt;
}
