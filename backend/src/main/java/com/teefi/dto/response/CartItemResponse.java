package com.teefi.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;
@Data @Builder
public class CartItemResponse {
    private UUID cartItemId;
    private UUID variantId;
    private UUID productId;
    private String productName;
    private String movieTitle;
    private String thumbnailUrl;
    private String size;
    private String color;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal lineTotal;
}
