package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.ProductResponseDTO;
import com.secondhand.electronics.entity.Favorite;
import com.secondhand.electronics.repository.FavoriteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductService productService;
    private final AuthService authService;

    // Resilient in-memory fallback cache
    private final Set<String> fallbackUserFavorites = ConcurrentHashMap.newKeySet(); // key: "userId:productId"
    private final AtomicLong favoriteIdGen = new AtomicLong(300);

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            ProductService productService,
            AuthService authService
    ) {
        this.favoriteRepository = favoriteRepository;
        this.productService = productService;
        this.authService = authService;
    }

    public Map<String, Object> toggleFavorite(String userEmail, Long productId) {
        var userDto = authService.getCurrentUser(userEmail);
        Long userId = userDto.getId();
        String cacheKey = userId + ":" + productId;

        boolean isFav = false;
        try {
            Optional<Favorite> existing = favoriteRepository.findByUserIdAndProductId(userId, productId);
            if (existing.isPresent()) {
                favoriteRepository.delete(existing.get());
                fallbackUserFavorites.remove(cacheKey);
                isFav = false;
            } else {
                Favorite fav = new Favorite();
                fav.setUserId(userId);
                fav.setProductId(productId);
                fav.setCreatedAt(LocalDateTime.now());
                favoriteRepository.save(fav);
                fallbackUserFavorites.add(cacheKey);
                isFav = true;
            }
        } catch (Exception ignored) {
            // DB unreachable; toggle fallback
            if (fallbackUserFavorites.contains(cacheKey)) {
                fallbackUserFavorites.remove(cacheKey);
                isFav = false;
            } else {
                fallbackUserFavorites.add(cacheKey);
                isFav = true;
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("productId", productId);
        res.put("isFavorite", isFav);
        res.put("message", isFav ? "Added to wishlist" : "Removed from wishlist");
        return res;
    }

    public List<ProductResponseDTO> getMyFavorites(String userEmail) {
        var userDto = authService.getCurrentUser(userEmail);
        Long userId = userDto.getId();

        List<Long> productIds = new ArrayList<>();
        try {
            List<Favorite> favs = favoriteRepository.findByUserId(userId);
            for (Favorite f : favs) {
                productIds.add(f.getProductId());
            }
        } catch (Exception ignored) {}

        if (productIds.isEmpty()) {
            for (String key : fallbackUserFavorites) {
                if (key.startsWith(userId + ":")) {
                    try {
                        productIds.add(Long.parseLong(key.split(":")[1]));
                    } catch (Exception ignored) {}
                }
            }
        }

        return productIds.stream()
                .map(id -> productService.getProductById(id).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public boolean isFavorite(String userEmail, Long productId) {
        var userDto = authService.getCurrentUser(userEmail);
        Long userId = userDto.getId();
        String cacheKey = userId + ":" + productId;

        try {
            return favoriteRepository.existsByUserIdAndProductId(userId, productId);
        } catch (Exception ignored) {
            return fallbackUserFavorites.contains(cacheKey);
        }
    }
}
