package com.teefi.dto.request;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class CreateVariantRequest {
    private String size;
    private String color;
    private String material;
    @NotNull @Positive private BigDecimal price;
    private Integer stockQuantity;
    private String printfulVariantId;
    private String sku;
}
