package com.teefi.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
@Data @Builder
public class OrderItemResponse {
    private String productName;
    private String movieTitle;
    private String thumbnailUrl;
    private String variantSize;
    private String variantColor;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal lineTotal;
}
