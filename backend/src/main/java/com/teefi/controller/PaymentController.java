package com.teefi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.PaymentIntent;
import com.teefi.integration.payment.PaymentService;
import com.teefi.service.impl.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    /**
     * Razorpay webhook — called after payment success/failure.
     * Razorpay sends X-Razorpay-Signature header for HMAC verification.
     */
    @PostMapping("/webhook/razorpay")
    public ResponseEntity<String> razorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        try {
            if (!paymentService.verifyRazorpayWebhookSignature(payload, signature)) {
                log.warn("Invalid Razorpay webhook signature");
                return ResponseEntity.status(400).body("Invalid signature");
            }

            JsonNode event = objectMapper.readTree(payload);
            String eventType = event.get("event").asText();

            if ("payment.captured".equals(eventType)) {
                JsonNode payment = event.get("payload").get("payment").get("entity");
                String razorpayOrderId = payment.get("order_id").asText();
                String razorpayPaymentId = payment.get("id").asText();
                orderService.confirmPayment(razorpayOrderId, razorpayPaymentId);
                log.info("Razorpay payment captured: {} for order {}", razorpayPaymentId, razorpayOrderId);
            }

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Razorpay webhook processing failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Webhook processing failed");
        }
    }

    /**
     * Stripe webhook — called for payment_intent.succeeded etc.
     * Stripe sends Stripe-Signature header for signature verification.
     */
    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> stripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            com.stripe.model.Event event = paymentService.constructStripeWebhookEvent(payload, sigHeader);

            if ("payment_intent.succeeded".equals(event.getType())) {
                PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow(() -> new RuntimeException("Could not deserialize PaymentIntent"));
                orderService.confirmPayment(intent.getId(), intent.getLatestCharge());
                log.info("Stripe payment succeeded: {}", intent.getId());
            }

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Stripe webhook processing failed: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body("Webhook error: " + e.getMessage());
        }
    }

    /**
     * Frontend-initiated verification (Razorpay returns to frontend after payment).
     * Frontend calls this to confirm payment was genuine before showing success page.
     */
    @PostMapping("/verify/razorpay")
    public ResponseEntity<Map<String, Object>> verifyRazorpay(@RequestBody Map<String, String> body) {
        String razorpayOrderId  = body.get("razorpay_order_id");
        String razorpayPaymentId = body.get("razorpay_payment_id");
        String signature         = body.get("razorpay_signature");

        boolean valid = paymentService.verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!valid) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Invalid signature"));
        }

        orderService.confirmPayment(razorpayOrderId, razorpayPaymentId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Payment verified"));
    }
}
