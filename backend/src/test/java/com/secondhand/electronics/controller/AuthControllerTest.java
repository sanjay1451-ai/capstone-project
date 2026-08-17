package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.LoginRequest;
import com.secondhand.electronics.dto.RegisterRequest;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.UserRepository;
import com.secondhand.electronics.security.JwtService;
import com.secondhand.electronics.service.AuthService;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;
    private AuthController authController;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        authController = new AuthController(authService);
    }

    @Test
    @DisplayName("POST /api/auth/register - Should register user and return token")
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest(
                "Jane Doe",
                "jane@example.com",
                "Password123!",
                "Password123!",
                "+1-555-9876",
                "789 Market St, Boston, MA"
        );

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);

        ResponseEntity<?> response = authController.register(req);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("POST /api/auth/login - Should authenticate valid credentials")
    void testLoginSuccess() {
        User user = new User("Jane Doe", "jane@example.com", passwordEncoder.encode("Password123!"), "+1-555-9876", "789 Market St", null, "ROLE_USER");
        user.setId(10L);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));

        LoginRequest req = new LoginRequest("jane@example.com", "Password123!");
        ResponseEntity<?> response = authController.login(req);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("GET /api/auth/me - Should return authenticated profile")
    void testGetProfileSuccess() {
        User user = new User("Jane Doe", "jane@example.com", "hash", "+1-555-9876", "789 Market St", null, "ROLE_USER");
        user.setId(10L);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("jane@example.com");
        when(authentication.getPrincipal()).thenReturn("jane@example.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        ResponseEntity<?> response = authController.getCurrentUser();
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
