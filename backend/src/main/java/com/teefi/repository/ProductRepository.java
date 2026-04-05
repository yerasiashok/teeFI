package com.teefi.repository;
import com.teefi.entity.Product;
import com.teefi.enums.Language;
import com.teefi.enums.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Page<Product> findByActiveTrue(Pageable pageable);
    Page<Product> findByActiveTrueAndLanguage(Language language, Pageable pageable);
    Page<Product> findByActiveTrueAndProductType(ProductType productType, Pageable pageable);
    Page<Product> findByActiveTrueAndLanguageAndProductType(Language language, ProductType productType, Pageable pageable);
    List<Product> findByActiveTrueAndFeaturedTrue();
    @Query("SELECT p FROM Product p WHERE p.active = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.movieTitle) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.tags) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Product> searchProducts(@Param("q") String query, Pageable pageable);
    @Query("SELECT DISTINCT p.movieTitle FROM Product p WHERE p.active = true ORDER BY p.movieTitle")
    List<String> findAllMovieTitles();
}
