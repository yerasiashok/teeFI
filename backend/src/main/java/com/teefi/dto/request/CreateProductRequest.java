package com.teefi.dto.request;
import com.teefi.enums.Language;
import com.teefi.enums.ProductType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
@Data
public class CreateProductRequest {
    @NotBlank private String name;
    private String description;
    @NotBlank private String movieTitle;
    @NotNull private Language language;
    @NotNull private ProductType productType;
    @NotNull @Positive private BigDecimal basePrice;
    private String thumbnailUrl;
    private List<String> imageUrls;
    private String printfulBlueprintId;
    private String printfulTemplateId;
    private boolean featured;
    private String director;
    private Integer releaseYear;
    private String tags;
    private List<CreateVariantRequest> variants;
}
