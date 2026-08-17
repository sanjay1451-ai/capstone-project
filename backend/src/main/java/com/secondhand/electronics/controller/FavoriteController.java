package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.ApiResponse;
import com.secondhand.electronics.dto.ProductResponseDTO;
import com.secondhand.electronics.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    /**
     * POST /api/favorites/{productId}
     * Toggle saving a product to user's favorites / wishlist
     */
    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFavorite(@PathVariable Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to save items to wishlist"));
        }

        try {
            String userEmail = auth.getName();
            Map<String, Object> result = favoriteService.toggleFavorite(userEmail, productId);
            return ResponseEntity.ok(ApiResponse.success((String) result.get("message"), result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update wishlist: " + e.getMessage()));
        }
    }

    /**
     * GET /api/favorites
     * Retrieve all saved favorite products for the current user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getMyFavorites() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to view your wishlist"));
        }

        try {
            String userEmail = auth.getName();
            List<ProductResponseDTO> favorites = favoriteService.getMyFavorites(userEmail);
            return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved successfully", favorites));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve wishlist: " + e.getMessage()));
        }
    }

    /**
     * GET /api/favorites/check/{productId}
     * Check if a specific product is favorited by the current user
     */
    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkFavorite(@PathVariable Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.ok(ApiResponse.success("Status", Map.of("productId", productId, "isFavorite", false)));
        }

        try {
            String userEmail = auth.getName();
            boolean isFav = favoriteService.isFavorite(userEmail, productId);
            return ResponseEntity.ok(ApiResponse.success("Status", Map.of("productId", productId, "isFavorite", isFav)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Status", Map.of("productId", productId, "isFavorite", false)));
        }
    }
}
