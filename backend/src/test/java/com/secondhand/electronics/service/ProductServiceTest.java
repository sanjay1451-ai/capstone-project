package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.ProductDTO;
import com.secondhand.electronics.dto.ProductResponseDTO;
import com.secondhand.electronics.entity.Product;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.ProductImageRepository;
import com.secondhand.electronics.repository.ProductRepository;
import com.secondhand.electronics.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private UserRepository userRepository;

    private ProductService productService;

    @BeforeEach
    void setUp() {
        productService = new ProductService(productRepository, productImageRepository, userRepository);
    }

    @Test
    @DisplayName("Should successfully create product attached to authenticated seller")
    void testCreateProductSuccess() {
        User seller = new User("Seller User", "seller@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        seller.setId(7L);

        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(seller));

        Product savedProduct = new Product();
        savedProduct.setId(501L);
        savedProduct.setSellerId(7L);
        savedProduct.setTitle("iPad Air M2");
        savedProduct.setCategory("Tablets");
        savedProduct.setCondition("LIKE_NEW");
        savedProduct.setPrice(new BigDecimal("549.00"));
        savedProduct.setStatus("AVAILABLE");

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        ProductDTO dto = new ProductDTO();
        dto.setTitle("iPad Air M2");
        dto.setCategory("Tablets");
        dto.setCondition("LIKE_NEW");
        dto.setPrice(new BigDecimal("549.00"));
        dto.setImageUrls(List.of("https://example.com/ipad.jpg"));

        ProductResponseDTO res = productService.createProduct(dto, "seller@example.com");

        assertNotNull(res);
        assertEquals(501L, res.getId());
        assertEquals(7L, res.getSellerId());
        assertEquals("iPad Air M2", res.getTitle());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when price is invalid or zero")
    void testCreateProductInvalidPrice() {
        ProductDTO dto = new ProductDTO();
        dto.setTitle("Faulty Item");
        dto.setCategory("Audio");
        dto.setCondition("GOOD");
        dto.setPrice(new BigDecimal("0.00"));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> productService.createProduct(dto, "seller@example.com"));
        assertTrue(ex.getMessage().contains("Price must be greater than $0.00"));
    }

    @Test
    @DisplayName("Should allow owner to update product and prevent unauthorized user")
    void testUpdateProductOwnership() {
        User owner = new User("Owner", "owner@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        owner.setId(7L);

        User stranger = new User("Stranger", "stranger@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        stranger.setId(99L);

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("stranger@example.com")).thenReturn(Optional.of(stranger));

        Product product = new Product();
        product.setId(601L);
        product.setSellerId(7L);
        product.setTitle("Dell XPS 15");
        product.setCategory("Laptops");
        product.setCondition("EXCELLENT");
        product.setPrice(new BigDecimal("1200.00"));

        when(productRepository.findById(601L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        ProductDTO updateDto = new ProductDTO();
        updateDto.setTitle("Dell XPS 15 - Upgraded");
        updateDto.setCategory("Laptops");
        updateDto.setCondition("EXCELLENT");
        updateDto.setPrice(new BigDecimal("1150.00"));

        // Unauthorized user attempts update -> should throw SecurityException
        assertThrows(SecurityException.class,
                () -> productService.updateProduct(601L, updateDto, "stranger@example.com"));

        // Authorized owner updates -> succeeds
        var updated = productService.updateProduct(601L, updateDto, "owner@example.com");
        assertTrue(updated.isPresent());
        assertEquals("Dell XPS 15 - Upgraded", updated.get().getTitle());
    }

    @Test
    @DisplayName("Should allow owner to delete product and prevent unauthorized user")
    void testDeleteProductOwnership() {
        User owner = new User("Owner", "owner@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        owner.setId(7L);

        User stranger = new User("Stranger", "stranger@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        stranger.setId(99L);

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("stranger@example.com")).thenReturn(Optional.of(stranger));

        Product product = new Product();
        product.setId(701L);
        product.setSellerId(7L);
        product.setTitle("Nintendo Switch OLED");

        when(productRepository.findById(701L)).thenReturn(Optional.of(product));
        when(productRepository.existsById(701L)).thenReturn(true);

        // Stranger attempts delete -> fails
        assertThrows(SecurityException.class,
                () -> productService.deleteProduct(701L, "stranger@example.com"));

        // Owner deletes -> succeeds
        boolean deleted = productService.deleteProduct(701L, "owner@example.com");
        assertTrue(deleted);
    }
}
