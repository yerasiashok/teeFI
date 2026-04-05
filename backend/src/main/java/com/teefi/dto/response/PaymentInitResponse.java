package com.teefi.dto.response;
import com.teefi.enums.PaymentProvider;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
@Data @Builder
public class PaymentInitResponse {
    private String orderId;          // internal order id
    private String orderNumber;
    private String paymentOrderId;   // Razorpay order_id / Stripe client_secret
    private PaymentProvider provider;
    private BigDecimal amount;
    private String currency;
    private String razorpayKeyId;    // sent to frontend for Razorpay checkout
    private String stripePublishableKey;
}
