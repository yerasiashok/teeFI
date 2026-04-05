package com.teefi.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;
@Data @Builder
public class VariantResponse {
    private UUID id;
    private String size;
    private String color;
    private String material;
    private BigDecimal price;
    private boolean available;
    private String printfulVariantId;
    private String sku;
}
