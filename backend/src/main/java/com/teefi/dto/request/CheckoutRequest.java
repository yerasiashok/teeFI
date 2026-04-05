package com.teefi.dto.request;
import com.teefi.enums.PaymentProvider;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;
@Data
public class CheckoutRequest {
    @NotNull private UUID addressId;
    @NotNull private PaymentProvider paymentProvider;
    private String notes;
}
