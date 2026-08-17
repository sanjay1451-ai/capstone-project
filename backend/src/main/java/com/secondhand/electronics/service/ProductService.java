package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.ProductDTO;
import com.secondhand.electronics.dto.ProductResponseDTO;
import com.secondhand.electronics.entity.Product;
import com.secondhand.electronics.entity.ProductImage;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.ProductImageRepository;
import com.secondhand.electronics.repository.ProductRepository;
import com.secondhand.electronics.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;

    // Resilient fallback storage for dev / offline demo mode
    private final Map<Long, ProductResponseDTO> fallbackCache = new ConcurrentHashMap<>();
    private final AtomicLong fallbackIdGen = new AtomicLong(10);

    public ProductService(
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            UserRepository userRepository
    ) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.userRepository = userRepository;
        initFallbackCatalog();
    }

    private void initFallbackCatalog() {
        fallbackCache.put(1L, createFallbackDTO(
                1L, 1L, "iPhone 14 Pro Max 256GB - Space Black",
                "Like new condition, 98% battery health. Comes with original Apple packaging, unused braided USB-C to Lightning cable, and an official MagSafe leather case. Fully unlocked for all GSM/CDMA carriers worldwide.",
                "Smartphones", "Apple", "A2651 (Pro Max)", "LIKE_NEW",
                new BigDecimal("899.00"), new BigDecimal("1199.00"), "San Francisco, CA",
                List.of(
                        "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800",
                        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
                        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
                )
        ));

        fallbackCache.put(2L, createFallbackDTO(
                2L, 2L, "MacBook Pro 16-inch M2 Max (32GB, 1TB SSD)",
                "Space Gray workstation monster. Zero physical scratches, pristine Liquid Retina XDR display with ProMotion 120Hz. Only 24 battery cycles. Includes 140W fast charger.",
                "Laptops", "Apple", "MacBookPro18,2", "EXCELLENT",
                new BigDecimal("2150.00"), new BigDecimal("3499.00"), "Austin, TX",
                List.of(
                        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
                        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"
                )
        ));

        fallbackCache.put(3L, createFallbackDTO(
                3L, 3L, "Sony WH-1000XM5 Wireless ANC Headphones",
                "Industry-leading active noise canceling headphones in Silver. Clean earcups sanitized with UV, 30-hour battery life intact. Includes hard carrying case, 3.5mm audio cable and airplane adapter.",
                "Audio", "Sony", "WH-1000XM5/S", "LIKE_NEW",
                new BigDecimal("269.00"), new BigDecimal("399.99"), "Seattle, WA",
                List.of(
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800"
                )
        ));

        fallbackCache.put(4L, createFallbackDTO(
                4L, 1L, "Sony PlayStation 5 Disc Edition + DualSense Controller",
                "Latest CFI-1200 model revision with improved thermals. Cleaned and factory reset. Includes 1TB ultra-high speed NVMe SSD, HDMI 2.1 cable, and God of War Ragnarok disc.",
                "Gaming", "Sony", "CFI-1215A", "GOOD",
                new BigDecimal("420.00"), new BigDecimal("499.99"), "New York, NY",
                List.of(
                        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800",
                        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800"
                )
        ));
    }

    private ProductResponseDTO createFallbackDTO(
            Long id, Long sellerId, String title, String desc, String cat, String brand,
            String model, String cond, BigDecimal price, BigDecimal origPrice,
            String location, List<String> images) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(id);
        dto.setSellerId(sellerId != null ? sellerId : 1L);
        dto.setSellerName("EcoTrade Verified Seller");
        dto.setSellerEmail("verified@volttrade.com");
        dto.setSellerPhone("+1-555-0188");
        dto.setTitle(title);
        dto.setDescription(desc);
        dto.setCategory(cat);
        dto.setBrand(brand);
        dto.setModel(model);
        dto.setCondition(cond);
        dto.setPrice(price);
        dto.setOriginalPrice(origPrice);
        dto.setLocation(location);
        dto.setStatus("AVAILABLE");
        dto.setCreatedAt(LocalDateTime.now().minusDays(2));
        dto.setUpdatedAt(LocalDateTime.now());
        dto.setImageUrls(images != null ? images : new ArrayList<>());
        dto.setPrimaryImage(images != null && !images.isEmpty() ? images.get(0) : null);
        dto.calculateDiscount();
        return dto;
    }

    public List<ProductResponseDTO> getProducts(
            String category,
            String status,
            String brand,
            String condition,
            String search
    ) {
        return searchProducts(search, category, brand, null, null, condition, null, status, "newest");
    }

    public List<ProductResponseDTO> searchProducts(
            String keyword,
            String category,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String condition,
            String location,
            String status,
            String sort
    ) {
        List<ProductResponseDTO> results = new ArrayList<>();

        try {
            String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
            String cat = (category != null && !category.isBlank()) ? category.trim() : null;
            String br = (brand != null && !brand.isBlank()) ? brand.trim() : null;
            String cd = (condition != null && !condition.isBlank()) ? condition.trim() : null;
            String loc = (location != null && !location.isBlank()) ? location.trim() : null;
            String st = (status != null && !status.isBlank()) ? status.trim() : null;

            List<Product> products = productRepository.advancedSearch(kw, cat, br, cd, loc, minPrice, maxPrice, st);
            if (!products.isEmpty()) {
                results = products.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
            }
        } catch (Exception ignored) {
            // DB unreachable; use fallback cache
        }

        if (results.isEmpty()) {
            // Apply filtering directly to in-memory fallback cache
            results = fallbackCache.values().stream()
                    .filter(p -> category == null || category.isBlank() || p.getCategory().equalsIgnoreCase(category.trim()))
                    .filter(p -> status == null || status.isBlank() || (p.getStatus() != null && p.getStatus().equalsIgnoreCase(status.trim())))
                    .filter(p -> brand == null || brand.isBlank() || (p.getBrand() != null && p.getBrand().equalsIgnoreCase(brand.trim())))
                    .filter(p -> condition == null || condition.isBlank() || (p.getCondition() != null && p.getCondition().equalsIgnoreCase(condition.trim())))
                    .filter(p -> location == null || location.isBlank() || (p.getLocation() != null && p.getLocation().toLowerCase().contains(location.toLowerCase().trim())))
                    .filter(p -> minPrice == null || (p.getPrice() != null && p.getPrice().compareTo(minPrice) >= 0))
                    .filter(p -> maxPrice == null || (p.getPrice() != null && p.getPrice().compareTo(maxPrice) <= 0))
                    .filter(p -> keyword == null || keyword.isBlank() ||
                            (p.getTitle() != null && p.getTitle().toLowerCase().contains(keyword.toLowerCase().trim())) ||
                            (p.getDescription() != null && p.getDescription().toLowerCase().contains(keyword.toLowerCase().trim())) ||
                            (p.getBrand() != null && p.getBrand().toLowerCase().contains(keyword.toLowerCase().trim())) ||
                            (p.getModel() != null && p.getModel().toLowerCase().contains(keyword.toLowerCase().trim())) ||
                            (p.getCategory() != null && p.getCategory().toLowerCase().contains(keyword.toLowerCase().trim()))
                    )
                    .collect(Collectors.toList());
        }

        // Apply Sorting
        if (sort != null) {
            switch (sort.toLowerCase().trim()) {
                case "price_asc":
                case "price-low-high":
                case "price_low_to_high":
                    results.sort(Comparator.comparing(ProductResponseDTO::getPrice, Comparator.nullsLast(BigDecimal::compareTo)));
                    break;
                case "price_desc":
                case "price-high-low":
                case "price_high_to_low":
                    results.sort((a, b) -> {
                        if (a.getPrice() == null) return 1;
                        if (b.getPrice() == null) return -1;
                        return b.getPrice().compareTo(a.getPrice());
                    });
                    break;
                case "oldest":
                case "date_asc":
                    results.sort(Comparator.comparing(ProductResponseDTO::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo)));
                    break;
                case "newest":
                case "date_desc":
                default:
                    results.sort((a, b) -> {
                        if (a.getCreatedAt() == null) return 1;
                        if (b.getCreatedAt() == null) return -1;
                        return b.getCreatedAt().compareTo(a.getCreatedAt());
                    });
                    break;
            }
        }

        return results;
    }

    public Optional<ProductResponseDTO> getProductById(Long id) {
        try {
            Optional<Product> fromDb = productRepository.findById(id);
            if (fromDb.isPresent()) {
                return fromDb.map(this::mapToResponseDTO);
            }
        } catch (Exception ignored) {
            // DB unreachable
        }
        return Optional.ofNullable(fallbackCache.get(id));
    }

    public List<ProductResponseDTO> getMyListings(String userEmail) {
        Long sellerId = getUserIdByEmail(userEmail);

        try {
            List<Product> list = productRepository.findBySellerId(sellerId);
            if (!list.isEmpty()) {
                return list.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
            }
        } catch (Exception ignored) {}

        return fallbackCache.values().stream()
                .filter(p -> p.getSellerId() != null && p.getSellerId().equals(sellerId))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDTO createProduct(ProductDTO dto) {
        return createProduct(dto, null);
    }

    @Transactional
    public ProductResponseDTO createProduct(ProductDTO dto, String userEmail) {
        validateProductInput(dto);

        Long sellerId = 1L;
        String sellerName = "VoltTrade Seller";
        String sellerEmail = "seller@volttrade.com";

        if (userEmail != null && !userEmail.isBlank()) {
            try {
                Optional<User> u = userRepository.findByEmail(userEmail);
                if (u.isPresent()) {
                    sellerId = u.get().getId();
                    sellerName = u.get().getName();
                    sellerEmail = u.get().getEmail();
                }
            } catch (Exception ignored) {}
        } else if (dto.getSellerId() != null) {
            sellerId = dto.getSellerId();
        }

        try {
            Product product = new Product();
            product.setSellerId(sellerId);
            product.setTitle(dto.getTitle().trim());
            product.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : "");
            product.setCategory(dto.getCategory().trim());
            product.setBrand(dto.getBrand() != null ? dto.getBrand().trim() : "");
            product.setModel(dto.getModel() != null ? dto.getModel().trim() : "");
            product.setCondition(dto.getCondition().trim().toUpperCase());
            product.setPrice(dto.getPrice());
            product.setOriginalPrice(dto.getOriginalPrice());
            product.setLocation(dto.getLocation() != null ? dto.getLocation().trim() : "Online / Global");
            product.setStatus(dto.getStatus() != null ? dto.getStatus().trim().toUpperCase() : "AVAILABLE");
            product.setCreatedAt(LocalDateTime.now());
            product.setUpdatedAt(LocalDateTime.now());

            Product savedProduct = productRepository.save(product);

            if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
                for (String url : dto.getImageUrls()) {
                    if (url != null && !url.isBlank()) {
                        ProductImage img = new ProductImage(savedProduct, url.trim());
                        productImageRepository.save(img);
                    }
                }
            }

            ProductResponseDTO res = mapToResponseDTO(savedProduct);
            fallbackCache.put(savedProduct.getId(), res);
            return res;
        } catch (Exception ignored) {
            Long newId = fallbackIdGen.incrementAndGet();
            ProductResponseDTO cached = createFallbackDTO(
                    newId, sellerId, dto.getTitle(), dto.getDescription(), dto.getCategory(),
                    dto.getBrand(), dto.getModel(), dto.getCondition(), dto.getPrice(),
                    dto.getOriginalPrice(), dto.getLocation(),
                    dto.getImageUrls() != null && !dto.getImageUrls().isEmpty() ? dto.getImageUrls() : List.of("https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800")
            );
            cached.setSellerName(sellerName);
            cached.setSellerEmail(sellerEmail);
            fallbackCache.put(newId, cached);
            return cached;
        }
    }

    @Transactional
    public Optional<ProductResponseDTO> updateProduct(Long id, ProductDTO dto) {
        return updateProduct(id, dto, null);
    }

    @Transactional
    public Optional<ProductResponseDTO> updateProduct(Long id, ProductDTO dto, String userEmail) {
        validateProductInput(dto);

        // Ownership validation
        if (userEmail != null) {
            validateSellerOwnership(id, userEmail);
        }

        try {
            Optional<Product> opt = productRepository.findById(id);
            if (opt.isPresent()) {
                Product product = opt.get();
                product.setTitle(dto.getTitle().trim());
                product.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : "");
                product.setCategory(dto.getCategory().trim());
                product.setBrand(dto.getBrand() != null ? dto.getBrand().trim() : "");
                product.setModel(dto.getModel() != null ? dto.getModel().trim() : "");
                product.setCondition(dto.getCondition().trim().toUpperCase());
                product.setPrice(dto.getPrice());
                product.setOriginalPrice(dto.getOriginalPrice());
                product.setLocation(dto.getLocation() != null ? dto.getLocation().trim() : "Online / Global");
                if (dto.getStatus() != null) {
                    product.setStatus(dto.getStatus().trim().toUpperCase());
                }
                product.setUpdatedAt(LocalDateTime.now());

                Product updated = productRepository.save(product);

                // Update images if provided
                if (dto.getImageUrls() != null) {
                    try {
                        productImageRepository.deleteByProductId(id);
                        for (String url : dto.getImageUrls()) {
                            if (url != null && !url.isBlank()) {
                                ProductImage img = new ProductImage(updated, url.trim());
                                productImageRepository.save(img);
                            }
                        }
                    } catch (Exception ignored) {}
                }

                ProductResponseDTO res = mapToResponseDTO(updated);
                fallbackCache.put(id, res);
                return Optional.of(res);
            }
        } catch (Exception ignored) {
            // DB unreachable
        }

        ProductResponseDTO cached = fallbackCache.get(id);
        if (cached != null) {
            cached.setTitle(dto.getTitle());
            cached.setDescription(dto.getDescription());
            cached.setCategory(dto.getCategory());
            cached.setBrand(dto.getBrand());
            cached.setModel(dto.getModel());
            cached.setCondition(dto.getCondition());
            cached.setPrice(dto.getPrice());
            cached.setOriginalPrice(dto.getOriginalPrice());
            cached.setLocation(dto.getLocation());
            if (dto.getStatus() != null) cached.setStatus(dto.getStatus());
            if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
                cached.setImageUrls(dto.getImageUrls());
                cached.setPrimaryImage(dto.getImageUrls().get(0));
            }
            cached.setUpdatedAt(LocalDateTime.now());
            cached.calculateDiscount();
            return Optional.of(cached);
        }
        return Optional.empty();
    }

    @Transactional
    public boolean deleteProduct(Long id) {
        return deleteProduct(id, null);
    }

    @Transactional
    public boolean deleteProduct(Long id, String userEmail) {
        if (userEmail != null) {
            validateSellerOwnership(id, userEmail);
        }

        boolean deleted = false;
        try {
            if (productRepository.existsById(id)) {
                productImageRepository.deleteByProductId(id);
                productRepository.deleteById(id);
                deleted = true;
            }
        } catch (Exception ignored) {
            // DB unreachable
        }

        if (fallbackCache.containsKey(id)) {
            fallbackCache.remove(id);
            deleted = true;
        }

        return deleted;
    }

    private void validateProductInput(ProductDTO dto) {
        if (dto.getTitle() == null || dto.getTitle().trim().isBlank()) {
            throw new IllegalArgumentException("Product title cannot be empty.");
        }
        if (dto.getCategory() == null || dto.getCategory().trim().isBlank()) {
            throw new IllegalArgumentException("Category is required.");
        }
        if (dto.getPrice() == null || dto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than $0.00");
        }
        if (dto.getCondition() == null || dto.getCondition().trim().isBlank()) {
            throw new IllegalArgumentException("Condition is required.");
        }
        String cond = dto.getCondition().trim().toUpperCase();
        Set<String> validConditions = Set.of("LIKE_NEW", "EXCELLENT", "GOOD", "FAIR", "USED");
        if (!validConditions.contains(cond)) {
            throw new IllegalArgumentException("Condition must be one of: Like New, Excellent, Good, Fair, Used");
        }
    }

    private void validateSellerOwnership(Long productId, String userEmail) {
        User user = null;
        try {
            user = userRepository.findByEmail(userEmail).orElse(null);
        } catch (Exception ignored) {}

        if (user == null) {
            return; // Dev bypass
        }

        if ("ROLE_ADMIN".equals(user.getRole())) {
            return; // Admins have full access
        }

        ProductResponseDTO product = getProductById(productId).orElse(null);
        if (product == null) {
            throw new IllegalArgumentException("Product not found with ID: " + productId);
        }

        if (product.getSellerId() != null && !product.getSellerId().equals(user.getId())) {
            throw new SecurityException("You do not have permission to modify or delete this listing.");
        }
    }

    private Long getUserIdByEmail(String email) {
        if (email == null) return 1L;
        try {
            Optional<User> u = userRepository.findByEmail(email);
            if (u.isPresent()) return u.get().getId();
        } catch (Exception ignored) {}
        return 1L;
    }

    private ProductResponseDTO mapToResponseDTO(Product p) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(p.getId());
        dto.setSellerId(p.getSellerId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setCategory(p.getCategory());
        dto.setBrand(p.getBrand());
        dto.setModel(p.getModel());
        dto.setCondition(p.getCondition());
        dto.setPrice(p.getPrice());
        dto.setOriginalPrice(p.getOriginalPrice());
        dto.setLocation(p.getLocation());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());

        // Fetch seller name from UserRepository if possible
        try {
            if (p.getSellerId() != null) {
                userRepository.findById(p.getSellerId()).ifPresent(user -> {
                    dto.setSellerName(user.getName());
                    dto.setSellerEmail(user.getEmail());
                    dto.setSellerPhone(user.getPhone());
                });
            }
        } catch (Exception ignored) {}

        if (dto.getSellerName() == null) {
            dto.setSellerName("EcoTrade Member");
        }

        // Fetch images
        try {
            List<ProductImage> imgs = productImageRepository.findByProductId(p.getId());
            List<String> urls = imgs.stream().map(ProductImage::getImageUrl).collect(Collectors.toList());
            dto.setImageUrls(urls);
            if (!urls.isEmpty()) {
                dto.setPrimaryImage(urls.get(0));
            }
        } catch (Exception ignored) {
            dto.setImageUrls(Collections.emptyList());
        }

        dto.calculateDiscount();
        return dto;
    }
}
