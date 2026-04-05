package com.teefi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductVariant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String size;       // S, M, L, XL, XXL / A4, A3, A2 for posters
    private String color;
    private String material;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private Integer stockQuantity;

    // Printful specific variant ID
    private String printfulVariantId;

    private String sku;

    @Column(nullable = false)
    @Builder.Default
    private boolean available = true;
}
