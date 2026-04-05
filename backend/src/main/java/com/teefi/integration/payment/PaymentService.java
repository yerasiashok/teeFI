package com.teefi.integration.payment;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.teefi.dto.response.PaymentInitResponse;
import com.teefi.entity.Order;
import com.teefi.enums.PaymentProvider;
import com.teefi.exception.PaymentException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.HexFormat;

@Service
@Slf4j
public class PaymentService {

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${app.razorpay.webhook-secret}")
    private String razorpayWebhookSecret;

    @Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${app.stripe.webhook-secret}")
    private String stripeWebhookSecret;

    @Value("${app.stripe.publishable-key}")
    private String stripePublishableKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    // ---- Razorpay ----

    public PaymentInitResponse initiateRazorpay(Order order) {
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            // Razorpay works in paise (1 INR = 100 paise)
            long amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", order.getOrderNumber());
            orderRequest.put("notes", new JSONObject().put("order_id", order.getId().toString()));

            com.razorpay.Order razorpayOrder = client.orders.create(orderRequest);

            return PaymentInitResponse.builder()
                    .orderId(order.getId().toString())
                    .orderNumber(order.getOrderNumber())
                    .paymentOrderId(razorpayOrder.get("id"))
                    .provider(PaymentProvider.RAZORPAY)
                    .amount(order.getTotalAmount())
                    .currency("INR")
                    .razorpayKeyId(razorpayKeyId)
                    .build();

        } catch (RazorpayException e) {
            throw new PaymentException("Failed to initiate Razorpay payment: " + e.getMessage(), e);
        }
    }

    public boolean verifyRazorpaySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            String computed = HexFormat.of().formatHex(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            log.error("Razorpay signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean verifyRazorpayWebhookSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayWebhookSecret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            String computed = HexFormat.of().formatHex(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            log.error("Razorpay webhook verification failed: {}", e.getMessage());
            return false;
        }
    }

    // ---- Stripe ----

    public PaymentInitResponse initiateStripe(Order order) {
        try {
            // Convert to smallest currency unit (cents for USD, paise for INR)
            long amount = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount)
                    .setCurrency("usd")
                    .setDescription("teeFI Order " + order.getOrderNumber())
                    .putMetadata("order_id", order.getId().toString())
                    .putMetadata("order_number", order.getOrderNumber())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            return PaymentInitResponse.builder()
                    .orderId(order.getId().toString())
                    .orderNumber(order.getOrderNumber())
                    .paymentOrderId(intent.getClientSecret()) // client_secret for frontend
                    .provider(PaymentProvider.STRIPE)
                    .amount(order.getTotalAmount())
                    .currency("USD")
                    .stripePublishableKey(stripePublishableKey)
                    .build();

        } catch (StripeException e) {
            throw new PaymentException("Failed to initiate Stripe payment: " + e.getMessage(), e);
        }
    }

    public com.stripe.model.Event constructStripeWebhookEvent(String payload, String sigHeader) {
        try {
            return com.stripe.net.Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
        } catch (Exception e) {
            throw new PaymentException("Invalid Stripe webhook signature: " + e.getMessage(), e);
        }
    }
}
