package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.AdminStatsDTO;
import com.secondhand.electronics.dto.ProductDTO;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.ExchangeRequestRepository;
import com.secondhand.electronics.repository.OrderRepository;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ExchangeRequestRepository exchangeRequestRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private ReportRepository reportRepository;

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;
    private ProductService productService;
    private ReportService reportService;
    private AdminService adminService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        productService = new ProductService(productRepository, productImageRepository, userRepository);
        reportService = new ReportService(reportRepository, authService, productService);
        adminService = new AdminService(
                userRepository,
                orderRepository,
                exchangeRequestRepository,
                productService,
                authService,
                reportService
        );
    }

    @Test
    @DisplayName("Should retrieve platform KPI metrics and statistics")
    void testGetAdminStats() {
        AdminStatsDTO stats = adminService.getAdminStats();
        assertNotNull(stats);
        assertTrue(stats.getTotalProducts() >= 0);
        assertTrue(stats.getTotalUsers() >= 0);
    }

    @Test
    @DisplayName("Should retrieve all users with search filtering")
    void testGetAllUsers() {
        var users = adminService.getAllUsers("Alex");
        assertNotNull(users);
    }

    @Test
    @DisplayName("Should update user status to SUSPENDED")
    void testUpdateUserStatus() {
        var res = adminService.updateUserStatus(1L, "SUSPENDED");
        assertNotNull(res);
        assertEquals("SUSPENDED", res.getStatus());
    }

    @Test
    @DisplayName("Should update product status to SUSPENDED for moderation")
    void testUpdateProductStatus() {
        ProductDTO p = new ProductDTO();
        p.setSellerId(1L);
        p.setTitle("Questionable Device");
        p.setCategory("Smartphones");
        p.setCondition("USED");
        p.setPrice(new BigDecimal("199.00"));
        var created = productService.createProduct(p);

        var updated = adminService.updateProductStatus(created.getId(), "SUSPENDED");
        assertNotNull(updated);
        assertEquals("SUSPENDED", updated.getStatus());
    }
}
