package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.ProductDTO;
import com.secondhand.electronics.entity.Favorite;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.FavoriteRepository;
import com.secondhand.electronics.repository.ProductImageRepository;
import com.secondhand.electronics.repository.ProductRepository;
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
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

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
    private FavoriteService favoriteService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        productService = new ProductService(productRepository, productImageRepository, userRepository);
        favoriteService = new FavoriteService(favoriteRepository, productService, authService);
    }

    @Test
    @DisplayName("Should toggle item to favorite wishlist and return isFavorite true")
    void testToggleFavoriteAdd() {
        User user = new User("User One", "user1@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        user.setId(10L);

        when(userRepository.findByEmail("user1@example.com")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByUserIdAndProductId(10L, 50L)).thenReturn(Optional.empty());

        Map<String, Object> result = favoriteService.toggleFavorite("user1@example.com", 50L);

        assertNotNull(result);
        assertEquals(50L, result.get("productId"));
        assertEquals(true, result.get("isFavorite"));
        assertEquals("Added to wishlist", result.get("message"));
    }

    @Test
    @DisplayName("Should remove item when already in favorite wishlist")
    void testToggleFavoriteRemove() {
        User user = new User("User One", "user1@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        user.setId(10L);

        Favorite fav = new Favorite();
        fav.setId(1L);
        fav.setUserId(10L);
        fav.setProductId(50L);

        when(userRepository.findByEmail("user1@example.com")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByUserIdAndProductId(10L, 50L)).thenReturn(Optional.of(fav));

        Map<String, Object> result = favoriteService.toggleFavorite("user1@example.com", 50L);

        assertNotNull(result);
        assertEquals(50L, result.get("productId"));
        assertEquals(false, result.get("isFavorite"));
        assertEquals("Removed from wishlist", result.get("message"));
    }
}
