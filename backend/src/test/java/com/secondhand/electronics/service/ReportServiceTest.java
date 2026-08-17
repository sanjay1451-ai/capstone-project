package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.CreateReportRequest;
import com.secondhand.electronics.dto.ProductDTO;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.ProductImageRepository;
import com.secondhand.electronics.repository.ProductRepository;
import com.secondhand.electronics.repository.ReportRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;
    private ProductService productService;
    private ReportService reportService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        productService = new ProductService(productRepository, productImageRepository, userRepository);
        reportService = new ReportService(reportRepository, authService, productService);
    }

    @Test
    @DisplayName("Should submit report for a product listing")
    void testSubmitReportSuccess() {
        User user = new User("John Buyer", "john@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        user.setId(10L);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        ProductDTO p = new ProductDTO();
        p.setSellerId(1L);
        p.setTitle("Suspect Phone");
        p.setCategory("Smartphones");
        p.setCondition("USED");
        p.setPrice(new BigDecimal("150.00"));
        var createdProduct = productService.createProduct(p);

        CreateReportRequest req = new CreateReportRequest(createdProduct.getId(), "SCAM", "Seller demands wire transfer outside platform.");
        var rep = reportService.submitReport("john@example.com", req);

        assertNotNull(rep);
        assertEquals("SCAM", rep.getReason());
        assertEquals("PENDING", rep.getStatus());
    }

    @Test
    @DisplayName("Should resolve report")
    void testUpdateReportStatus() {
        var updated = reportService.updateReportStatus(1L, "RESOLVED");
        assertNotNull(updated);
        assertEquals("RESOLVED", updated.getStatus());
    }
}
