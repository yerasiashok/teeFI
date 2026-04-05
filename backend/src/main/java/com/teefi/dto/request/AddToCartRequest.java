package com.teefi.dto.request;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;
@Data
public class AddToCartRequest {
    @NotNull private UUID variantId;
    @Min(1) private int quantity = 1;
}
