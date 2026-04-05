package com.teefi.service.impl;

import com.teefi.dto.request.CreateProductRequest;
import com.teefi.dto.request.CreateVariantRequest;
import com.teefi.dto.response.ProductResponse;
import com.teefi.dto.response.VariantResponse;
import com.teefi.entity.Product;
import com.teefi.entity.ProductVariant;
import com.teefi.enums.Language;
import com.teefi.enums.ProductType;
import com.teefi.exception.ResourceNotFoundException;
import com.teefi.repository.ProductRepository;
import com.teefi.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    @Cacheable(value = "products", key = "#page + '-' + #size + '-' + #language + '-' + #type")
    public Page<ProductResponse> getProducts(int page, int size, Language language, ProductType type) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> products;
        if (language != null && type != null) {
            products = productRepository.findByActiveTrueAndLanguageAndProductType(language, type, pageable);
        } else if (language != null) {
            products = productRepository.findByActiveTrueAndLanguage(language, pageable);
        } else if (type != null) {
            products = productRepository.findByActiveTrueAndProductType(type, pageable);
        } else {
            products = productRepository.findByActiveTrue(pageable);
        }
        return products.map(this::toResponse);
    }

    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return toResponse(product);
    }

    @Cacheable(value = "featured-products")
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByActiveTrueAndFeaturedTrue()
                .stream().map(this::toResponse).toList();
    }

    public Page<ProductResponse> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.searchProducts(query, pageable).map(this::toResponse);
    }

    @Cacheable(value = "movie-titles")
    public List<String> getAllMovieTitles() {
        return productRepository.findAllMovieTitles();
    }

    @Transactional
    @CacheEvict(value = {"products", "featured-products", "movie-titles"}, allEntries = true)
    public ProductResponse createProduct(CreateProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .movieTitle(request.getMovieTitle())
                .language(request.getLanguage())
                .productType(request.getProductType())
                .basePrice(request.getBasePrice())
                .thumbnailUrl(request.getThumbnailUrl())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : List.of())
                .printfulBlueprintId(request.getPrintfulBlueprintId())
                .printfulTemplateId(request.getPrintfulTemplateId())
                .featured(request.isFeatured())
                .director(request.getDirector())
                .releaseYear(request.getReleaseYear())
                .tags(request.getTags())
                .active(true)
                .build();
        productRepository.save(product);

        if (request.getVariants() != null) {
            for (CreateVariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .size(vr.getSize())
                        .color(vr.getColor())
                        .material(vr.getMaterial())
                        .price(vr.getPrice())
                        .stockQuantity(vr.getStockQuantity())
                        .printfulVariantId(vr.getPrintfulVariantId())
                        .sku(vr.getSku())
                        .available(true)
                        .build();
                variantRepository.save(variant);
                product.getVariants().add(variant);
            }
        }

        log.info("Product created: {} ({})", product.getName(), product.getId());
        return toResponse(product);
    }

    @Transactional
    @CacheEvict(value = {"products", "featured-products"}, allEntries = true)
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setActive(false);
        productRepository.save(product);
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .movieTitle(p.getMovieTitle())
                .language(p.getLanguage())
                .productType(p.getProductType())
                .basePrice(p.getBasePrice())
                .thumbnailUrl(p.getThumbnailUrl())
                .imageUrls(p.getImageUrls())
                .featured(p.isFeatured())
                .director(p.getDirector())
                .releaseYear(p.getReleaseYear())
                .tags(p.getTags())
                .createdAt(p.getCreatedAt())
                .variants(p.getVariants().stream()
                        .filter(ProductVariant::isAvailable)
                        .map(v -> VariantResponse.builder()
                                .id(v.getId())
                                .size(v.getSize())
                                .color(v.getColor())
                                .material(v.getMaterial())
                                .price(v.getPrice())
                                .available(v.isAvailable())
                                .printfulVariantId(v.getPrintfulVariantId())
                                .sku(v.getSku())
                                .build())
                        .toList())
                .build();
    }
}
