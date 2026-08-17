package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.ApiResponse;
import com.secondhand.electronics.dto.ProductDTO;
import com.secondhand.electronics.dto.ProductResponseDTO;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.ProductImageRepository;
import com.secondhand.electronics.repository.ProductRepository;
import com.secondhand.electronics.repository.UserRepository;
import com.secondhand.electronics.security.JwtService;
import com.secondhand.electronics.service.AuthService;
import com.secondhand.electronics.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;
    private ProductService productService;
    private ProductController productController;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        productService = new ProductService(productRepository, productImageRepository, userRepository);
        productController = new ProductController(productService);
    }

    @Test
    @DisplayName("GET /api/products - Should return list of products")
    void testGetProducts() {
        ResponseEntity<ApiResponse<List<ProductResponseDTO>>> response = productController.getProducts(
                null, null, null, null, null, null, null, null, null, "newest"
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("GET /api/products/{id} - Should return product by ID")
    void testGetProductById() {
        ProductDTO p = new ProductDTO();
        p.setSellerId(1L);
        p.setTitle("MacBook Pro M2");
        p.setCategory("Laptops & PCs");
        p.setCondition("LIKE_NEW");
        p.setPrice(new BigDecimal("1299.00"));
        var created = productService.createProduct(p);

        ResponseEntity<ApiResponse<ProductResponseDTO>> response = productController.getProductById(created.getId());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("MacBook Pro M2", response.getBody().getData().getTitle());
    }

    @Test
    @DisplayName("POST /api/products - Should create product for authenticated seller")
    void testCreateProduct() {
        User user = new User("Seller", "seller@example.com", "hash", "123", "St", null, "ROLE_USER");
        user.setId(5L);
        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(user));

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("seller@example.com");
        when(authentication.getPrincipal()).thenReturn("seller@example.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        ProductDTO createDto = new ProductDTO();
        createDto.setTitle("Galaxy S23");
        createDto.setCategory("Smartphones");
        createDto.setPrice(new BigDecimal("499.00"));
        createDto.setCondition("LIKE_NEW");

        ResponseEntity<ApiResponse<ProductResponseDTO>> response = productController.createProduct(createDto);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().getData().getId());
    }
}
