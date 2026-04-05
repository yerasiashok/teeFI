package com.teefi.dto.response;
import com.teefi.enums.Language;
import com.teefi.enums.ProductType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Data @Builder
public class ProductResponse {
    private UUID id;
    private String name;
    private String description;
    private String movieTitle;
    private Language language;
    private ProductType productType;
    private BigDecimal basePrice;
    private String thumbnailUrl;
    private List<String> imageUrls;
    private boolean featured;
    private String director;
    private Integer releaseYear;
    private String tags;
    private List<VariantResponse> variants;
    private LocalDateTime createdAt;
}
