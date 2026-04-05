package com.teefi.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class AddressRequest {
    @NotBlank private String fullName;
    @NotBlank private String line1;
    private String line2;
    @NotBlank private String city;
    @NotBlank private String state;
    @NotBlank private String pincode;
    @NotBlank private String country;
    private String phone;
    private boolean isDefault;
}
