package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.CreateReviewRequest;
import com.secondhand.electronics.dto.ProductDTO;
import com.secondhand.electronics.dto.ReviewResponseDTO;
import com.secondhand.electronics.entity.Review;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.ProductImageRepository;
import com.secondhand.electronics.repository.ProductRepository;
import com.secondhand.electronics.repository.ReviewRepository;
import com.secondhand.electronics.repository.UserRepository;
import com.secondhand.electronics.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

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
    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        productService = new ProductService(productRepository, productImageRepository, userRepository);
        reviewService = new ReviewService(reviewRepository, productService, authService);
    }

    @Test
    @DisplayName("Should submit a product review and return sanitized ReviewResponseDTO")
    void testAddReviewSuccess() {
        User user = new User("Reviewer User", "reviewer@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        user.setId(15L);

        when(userRepository.findByEmail("reviewer@example.com")).thenReturn(Optional.of(user));

        ProductDTO p = new ProductDTO();
        p.setSellerId(5L);
        p.setTitle("Sony WH-1000XM5");
        p.setCategory("Audio");
        p.setCondition("LIKE_NEW");
        p.setPrice(new BigDecimal("279.00"));
        var createdProduct = productService.createProduct(p);
        Long productId = createdProduct.getId();

        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(401L);
            return r;
        });

        CreateReviewRequest req = new CreateReviewRequest(5, "Amazing sound quality and noise cancellation!");
        ReviewResponseDTO res = reviewService.addReview("reviewer@example.com", productId, req);

        assertNotNull(res);
        assertEquals(401L, res.getId());
        assertEquals(15L, res.getReviewerId());
        assertEquals(5, res.getRating());
        assertEquals("Amazing sound quality and noise cancellation!", res.getComment());
        assertEquals("Sony WH-1000XM5", res.getProductTitle());
    }

    @Test
    @DisplayName("Should retrieve rating summary with correct average and count")
    void testGetRatingSummary() {
        var summary = reviewService.getProductRatingSummary(1L);
        assertNotNull(summary);
        assertTrue(summary.containsKey("averageRating"));
        assertTrue(summary.containsKey("totalReviews"));
    }

    @Test
    @DisplayName("Should reject duplicate review by same user on same product")
    void testDuplicateReviewRejected() {
        User user = new User("Reviewer User", "reviewer@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        user.setId(15L);

        when(userRepository.findByEmail("reviewer@example.com")).thenReturn(Optional.of(user));

        ProductDTO p = new ProductDTO();
        p.setSellerId(5L);
        p.setTitle("Sony WH-1000XM5");
        p.setCategory("Audio");
        p.setCondition("LIKE_NEW");
        p.setPrice(new BigDecimal("279.00"));
        var createdProduct = productService.createProduct(p);
        Long productId = createdProduct.getId();

        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(401L);
            return r;
        });

        CreateReviewRequest req = new CreateReviewRequest(5, "First review!");
        reviewService.addReview("reviewer@example.com", productId, req);

        // Second review on same product should throw exception
        CreateReviewRequest req2 = new CreateReviewRequest(4, "Second review attempt!");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> reviewService.addReview("reviewer@example.com", productId, req2));
        assertTrue(ex.getMessage().contains("already reviewed"));
    }
}
