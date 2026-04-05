package com.teefi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teefi.integration.printful.PrintfulService;
import com.teefi.service.impl.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/printful")
@RequiredArgsConstructor
@Slf4j
public class PrintfulWebhookController {

    private final PrintfulService printfulService;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @Value("${app.printful.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-PF-Signature", required = false) String signature) {
        try {
            // Verify signature if secret is configured
            if (webhookSecret != null && !webhookSecret.isBlank() && signature != null) {
                if (!printfulService.verifyWebhookSignature(payload, signature, webhookSecret)) {
                    log.warn("Invalid Printful webhook signature");
                    return ResponseEntity.status(400).body("Invalid signature");
                }
            }

            JsonNode event = objectMapper.readTree(payload);
            String type = event.get("type").asText();
            JsonNode data = event.get("data");

            log.info("Printful webhook received: {}", type);

            switch (type) {
                case "package_shipped" -> {
                    String podOrderId   = data.get("order").get("id").asText();
                    JsonNode shipment   = data.get("shipment");
                    String tracking     = shipment.get("tracking_number").asText();
                    String trackingUrl  = shipment.get("tracking_url").asText();
                    String carrier      = shipment.get("carrier").asText();
                    orderService.updateShipping(podOrderId, tracking, trackingUrl, carrier);
                    log.info("Order {} shipped via {} tracking: {}", podOrderId, carrier, tracking);
                }
                case "order_updated" -> {
                    log.info("Printful order updated: {}", data.get("order").get("id").asText());
                }
                default -> log.debug("Unhandled Printful event type: {}", type);
            }

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Printful webhook error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error");
        }
    }
}
