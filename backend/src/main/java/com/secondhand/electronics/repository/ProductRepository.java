package com.secondhand.electronics.repository;

import com.secondhand.electronics.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryIgnoreCase(String category);

    List<Product> findByStatus(String status);

    List<Product> findBySellerId(Long sellerId);

    List<Product> findByBrandIgnoreCase(String brand);

    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:status IS NULL OR LOWER(p.status) = LOWER(:status)) AND " +
           "(:brand IS NULL OR LOWER(p.brand) = LOWER(:brand)) AND " +
           "(:condition IS NULL OR LOWER(p.condition) = LOWER(:condition)) AND " +
           "(:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.createdAt DESC")
    List<Product> searchProducts(
            @Param("category") String category,
            @Param("status") String status,
            @Param("brand") String brand,
            @Param("condition") String condition,
            @Param("keyword") String keyword
    );
}
