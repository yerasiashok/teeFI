package com.teefi.integration.printful;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.teefi.kafka.KafkaEvents;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrintfulService {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.printful.api-key}")
    private String apiKey;

    @Value("${app.printful.api-url}")
    private String apiUrl;

    @Value("${app.aws.s3.bucket-name}")
    private String s3Bucket;

    @Value("${app.aws.region}")
    private String awsRegion;

    /**
     * Submit an order to Printful for fulfillment.
     * Called after ORDER_PAID event is consumed.
     */
    public PrintfulOrderResponse createOrder(KafkaEvents.OrderPaidEvent event) {
        PrintfulOrderRequest request = buildPrintfulOrder(event);

        return getWebClient()
                .post()
                .uri("/orders")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(PrintfulOrderResponse.class)
                .doOnSuccess(r -> log.info("Printful order created: {} for order {}", r.getResult().getId(), event.getOrderId()))
                .doOnError(e -> log.error("Printful order creation failed for order {}: {}", event.getOrderId(), e.getMessage()))
                .block();
    }

    /**
     * Get order status from Printful.
     */
    public PrintfulOrderResult getOrder(String printfulOrderId) {
        return getWebClient()
                .get()
                .uri("/orders/" + printfulOrderId)
                .retrieve()
                .bodyToMono(PrintfulOrderResponse.class)
                .map(PrintfulOrderResponse::getResult)
                .block();
    }

    /**
     * Verify Printful webhook signature (HMAC-SHA256).
     */
    public boolean verifyWebhookSignature(String payload, String signature, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            String computed = java.util.HexFormat.of().formatHex(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            log.error("Webhook signature verification error: {}", e.getMessage());
            return false;
        }
    }

    private PrintfulOrderRequest buildPrintfulOrder(KafkaEvents.OrderPaidEvent event) {
        List<PrintfulLineItem> lineItems = event.getItems().stream().map(item -> {
            String artworkUrl = "https://" + s3Bucket + ".s3." + awsRegion + ".amazonaws.com/" + item.getS3ArtworkKey();
            return PrintfulLineItem.builder()
                    .variantId(Integer.parseInt(item.getPrintfulVariantId()))
                    .quantity(item.getQuantity())
                    .files(List.of(PrintfulFile.builder()
                            .type("default")
                            .url(artworkUrl)
                            .build()))
                    .build();
        }).toList();

        PrintfulRecipient recipient = PrintfulRecipient.builder()
                .name(event.getShippingFullName())
                .address1(event.getShippingLine1())
                .address2(event.getShippingLine2())
                .city(event.getShippingCity())
                .stateCode(event.getShippingState())
                .zip(event.getShippingPincode())
                .countryCode(mapToCountryCode(event.getShippingCountry()))
                .phone(event.getShippingPhone())
                .build();

        return PrintfulOrderRequest.builder()
                .externalId(event.getOrderId().toString())
                .shipping("STANDARD")
                .recipient(recipient)
                .items(lineItems)
                .build();
    }

    private String mapToCountryCode(String country) {
        return Map.of("India", "IN", "United States", "US", "United Kingdom", "GB")
                .getOrDefault(country, "IN");
    }

    private WebClient getWebClient() {
        return webClientBuilder.clone()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    // ---- Inner DTOs ----

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PrintfulOrderRequest {
        @JsonProperty("external_id") private String externalId;
        private String shipping;
        private PrintfulRecipient recipient;
        private List<PrintfulLineItem> items;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PrintfulRecipient {
        private String name;
        private String address1;
        private String address2;
        private String city;
        @JsonProperty("state_code") private String stateCode;
        private String zip;
        @JsonProperty("country_code") private String countryCode;
        private String phone;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PrintfulLineItem {
        @JsonProperty("variant_id") private Integer variantId;
        private Integer quantity;
        private List<PrintfulFile> files;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PrintfulFile {
        private String type;
        private String url;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class PrintfulOrderResponse {
        private Integer code;
        private PrintfulOrderResult result;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class PrintfulOrderResult {
        private Long id;
        private String status;
        @JsonProperty("external_id") private String externalId;
        private List<PrintfulShipment> shipments;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class PrintfulShipment {
        private String carrier;
        private String service;
        @JsonProperty("tracking_number") private String trackingNumber;
        @JsonProperty("tracking_url") private String trackingUrl;
    }
}
