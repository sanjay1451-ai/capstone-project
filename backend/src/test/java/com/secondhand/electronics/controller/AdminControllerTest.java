package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.AdminStatsDTO;
import com.secondhand.electronics.dto.ApiResponse;
import com.secondhand.electronics.dto.UserResponseDTO;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.*;
import com.secondhand.electronics.security.JwtService;
import com.secondhand.electronics.service.AdminService;
import com.secondhand.electronics.service.AuthService;
import com.secondhand.electronics.service.ProductService;
import com.secondhand.electronics.service.ReportService;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

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
    private AdminController adminController;

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
        adminController = new AdminController(adminService, authService);
    }

    private void mockAdminAuth() {
        User adminUser = new User("Admin User", "admin@volttrade.com", "hash", "123", "HQ", null, "ROLE_ADMIN");
        adminUser.setId(3L);
        when(userRepository.findByEmail("admin@volttrade.com")).thenReturn(Optional.of(adminUser));

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin@volttrade.com");
        when(authentication.getPrincipal()).thenReturn("admin@volttrade.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("GET /api/admin/stats - Should return platform KPI stats for Admin")
    void testGetStatsSuccess() {
        mockAdminAuth();
        ResponseEntity<ApiResponse<AdminStatsDTO>> response = adminController.getStats();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getData());
    }

    @Test
    @DisplayName("GET /api/admin/users - Should return user list for Admin")
    void testGetUsersSuccess() {
        mockAdminAuth();
        ResponseEntity<ApiResponse<List<UserResponseDTO>>> response = adminController.getUsers("Alex");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getData());
    }

    @Test
    @DisplayName("GET /api/admin/stats - Should reject non-admin users with 403 Forbidden")
    void testGetStatsForbiddenForRegularUser() {
        User regularUser = new User("Regular User", "regular@example.com", "hash", "123", "St", null, "ROLE_USER");
        regularUser.setId(1L);
        when(userRepository.findByEmail("regular@example.com")).thenReturn(Optional.of(regularUser));

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("regular@example.com");
        when(authentication.getPrincipal()).thenReturn("regular@example.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        ResponseEntity<ApiResponse<AdminStatsDTO>> response = adminController.getStats();
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }
}
