package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.*;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.UserRepository;
import com.secondhand.electronics.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    @DisplayName("Should successfully register a new user with BCrypt hashed password and valid JWT")
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest(
                "John Doe",
                "john@example.com",
                "Secret123!",
                "Secret123!",
                "+1-555-0199",
                "456 Market St, SF"
        );

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertNotNull(res.getToken());
        assertEquals("Bearer", res.getTokenType());
        assertEquals("John Doe", res.getUser().getName());
        assertEquals("john@example.com", res.getUser().getEmail());
        assertEquals("ROLE_USER", res.getUser().getRole());
        assertEquals(10L, res.getUser().getId());

        // Validate JWT Claims
        String extractedEmail = jwtService.extractUsername(res.getToken());
        String extractedRole = jwtService.extractRole(res.getToken());
        assertEquals("john@example.com", extractedEmail);
        assertEquals("ROLE_USER", extractedRole);
    }

    @Test
    @DisplayName("Should reject registration when passwords do not match")
    void testRegisterPasswordMismatch() {
        RegisterRequest req = new RegisterRequest(
                "John Doe",
                "john@example.com",
                "Secret123!",
                "DifferentPassword!",
                "+1-555-0199",
                "456 Market St, SF"
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(req));
        assertEquals("Passwords do not match", ex.getMessage());
    }

    @Test
    @DisplayName("Should reject registration when email already exists")
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest(
                "John Doe",
                "john@example.com",
                "Secret123!",
                "Secret123!",
                "+1-555-0199",
                "456 Market St, SF"
        );

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    @DisplayName("Should successfully login with valid credentials and return JWT token")
    void testLoginSuccess() {
        String hashedPassword = passwordEncoder.encode("Password123!");
        User user = new User(
                "Alex Rivers",
                "alex@example.com",
                hashedPassword,
                "+1-555-0192",
                "San Francisco",
                null,
                "ROLE_USER"
        );
        user.setId(5L);

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));

        LoginRequest loginReq = new LoginRequest("alex@example.com", "Password123!");
        AuthResponse res = authService.login(loginReq);

        assertNotNull(res);
        assertNotNull(res.getToken());
        assertEquals("alex@example.com", res.getUser().getEmail());
        assertEquals("Alex Rivers", res.getUser().getName());
        assertEquals("ROLE_USER", res.getUser().getRole());
    }

    @Test
    @DisplayName("Should reject login with invalid password")
    void testLoginInvalidPassword() {
        String hashedPassword = passwordEncoder.encode("Password123!");
        User user = new User(
                "Alex Rivers",
                "alex@example.com",
                hashedPassword,
                null,
                null,
                null,
                "ROLE_USER"
        );
        user.setId(5L);

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));

        LoginRequest loginReq = new LoginRequest("alex@example.com", "WrongPassword!");
        assertThrows(BadCredentialsException.class, () -> authService.login(loginReq));
    }

    @Test
    @DisplayName("Should retrieve current user profile without exposing password")
    void testGetCurrentUser() {
        User user = new User(
                "Admin User",
                "admin@volttrade.com",
                passwordEncoder.encode("AdminPassword123!"),
                "+1-555-0100",
                "HQ",
                null,
                "ROLE_ADMIN"
        );
        user.setId(2L);

        when(userRepository.findByEmail("admin@volttrade.com")).thenReturn(Optional.of(user));

        UserResponseDTO profile = authService.getCurrentUser("admin@volttrade.com");
        assertNotNull(profile);
        assertEquals("Admin User", profile.getName());
        assertEquals("admin@volttrade.com", profile.getEmail());
        assertEquals("ROLE_ADMIN", profile.getRole());
    }

    @Test
    @DisplayName("Should update user profile successfully")
    void testUpdateProfile() {
        User user = new User(
                "Old Name",
                "user@example.com",
                passwordEncoder.encode("Password123!"),
                "111",
                "Old Address",
                null,
                "ROLE_USER"
        );
        user.setId(3L);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserProfileUpdateDTO updateDTO = new UserProfileUpdateDTO("New Name", "999-888-7777", "New Address", "https://avatar.url");
        UserResponseDTO updated = authService.updateProfile("user@example.com", updateDTO);

        assertEquals("New Name", updated.getName());
        assertEquals("999-888-7777", updated.getPhone());
        assertEquals("New Address", updated.getAddress());
        assertEquals("https://avatar.url", updated.getProfileImage());
    }
}
