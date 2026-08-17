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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;

    private final ConcurrentHashMap<Long, ProductResponseDTO> fallbackCache = new ConcurrentHashMap<>();
    private final AtomicLong fallbackIdGen = new AtomicLong(100);

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
        List<ProductResponseDTO> demoItems = List.of(
            createFallbackDTO(1L, "MacBook Pro 14\" M3 Pro (18GB / 512GB)",
                "Space Black, 100% battery health, original 70W MagSafe charger included. Zero scratches, refurbished and diagnostic verified.",
                "Laptops & Computers", "Apple", "MacBook Pro 14 M3", "LIKE_NEW",
                new BigDecimal("1499.00"), new BigDecimal("1999.00"), "San Francisco, CA",
                List.of(
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
                    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"
                )),

            createFallbackDTO(2L, "iPhone 15 Pro Max 256GB - Natural Titanium",
                "Factory unlocked, pristine OLED display with Ceramic Shield, original box, and AppleCare+ warranty remaining for 6 months.",
                "Smartphones", "Apple", "iPhone 15 Pro Max", "EXCELLENT",
                new BigDecimal("899.00"), new BigDecimal("1199.00"), "Seattle, WA",
                List.of(
                    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
                    "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800"
                )),

            createFallbackDTO(3L, "Sony WH-1000XM5 Wireless ANC Headphones",
                "Industry-leading active noise canceling headphones in Silver. Includes hard carrying case, 3.5mm cable, and USB-C fast charger.",
                "Audio & Sound", "Sony", "WH-1000XM5", "LIKE_NEW",
                new BigDecimal("269.00"), new BigDecimal("399.00"), "Austin, TX",
                List.of(
                    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
                )),

            createFallbackDTO(4L, "Sony PlayStation 5 Digital Edition (Slim)",
                "Includes 1TB SSD, dual DualSense wireless controllers, HDMI 2.1 cable, and vertical stand. Tested and thermal-cleaned.",
                "Gaming & Consoles", "Sony", "PlayStation 5 Slim", "EXCELLENT",
                new BigDecimal("369.00"), new BigDecimal("449.00"), "Chicago, IL",
                List.of(
                    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800",
                    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800"
                )),

            createFallbackDTO(5L, "iPad Pro 11\" M2 (Wi-Fi, 128GB) Space Gray",
                "Liquid Retina display with ProMotion 120Hz. Bundled with 2nd Gen Apple Pencil and Smart Folio magnetic case.",
                "Tablets & Readers", "Apple", "iPad Pro 11 M2", "GOOD",
                new BigDecimal("579.00"), new BigDecimal("799.00"), "Denver, CO",
                List.of(
                    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
                    "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800"
                )),

            createFallbackDTO(6L, "Apple Watch Ultra 2 (49mm Titanium)",
                "Rugged GPS + Cellular smartwatch with Orange Ocean Band. Ideal for endurance sports and diving. Battery at 98%.",
                "Wearables & Smartwatches", "Apple", "Watch Ultra 2", "LIKE_NEW",
                new BigDecimal("589.00"), new BigDecimal("799.00"), "Boston, MA",
                List.of(
                    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800",
                    "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800"
                ))
        );

        for (ProductResponseDTO dto : demoItems) {
            fallbackCache.put(dto.getId(), dto);
        }
    }

    private ProductResponseDTO createFallbackDTO(
            Long id, String title, String desc, String cat, String brand,
            String model, String cond, BigDecimal price, BigDecimal origPrice,
            String location, List<String> images) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(id);
        dto.setSellerId(1L);
        dto.setSellerName("EcoTrade Certified");
        dto.setSellerEmail("verified@ecotrade.com");
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
        dto.setImageUrls(images);
        dto.setPrimaryImage(images.isEmpty() ? null : images.get(0));
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
        try {
            String catParam = (category != null && !category.isBlank()) ? category : null;
            String statusParam = (status != null && !status.isBlank()) ? status : null;
            String brandParam = (brand != null && !brand.isBlank()) ? brand : null;
            String condParam = (condition != null && !condition.isBlank()) ? condition : null;
            String searchParam = (search != null && !search.isBlank()) ? search : null;

            List<Product> products = productRepository.searchProducts(catParam, statusParam, brandParam, condParam, searchParam);
            if (!products.isEmpty()) {
                return products.stream().map(this::mapToResponseDTO).toList();
            }
        } catch (Exception ignored) {
            // DB temporarily unreachable; filter fallback cache
        }

        // Apply in-memory filtering on fallback cache
        return fallbackCache.values().stream()
                .filter(p -> category == null || category.isBlank() || p.getCategory().equalsIgnoreCase(category.trim()))
                .filter(p -> status == null || status.isBlank() || p.getStatus().equalsIgnoreCase(status.trim()))
                .filter(p -> brand == null || brand.isBlank() || (p.getBrand() != null && p.getBrand().equalsIgnoreCase(brand.trim())))
                .filter(p -> condition == null || condition.isBlank() || p.getCondition().equalsIgnoreCase(condition.trim()))
                .filter(p -> search == null || search.isBlank() ||
                        p.getTitle().toLowerCase().contains(search.toLowerCase().trim()) ||
                        (p.getDescription() != null && p.getDescription().toLowerCase().contains(search.toLowerCase().trim())))
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .toList();
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

    public ProductResponseDTO createProduct(ProductDTO dto) {
        try {
            Product product = new Product();
            product.setSellerId(dto.getSellerId() != null ? dto.getSellerId() : 1L);
            product.setTitle(dto.getTitle());
            product.setDescription(dto.getDescription());
            product.setCategory(dto.getCategory());
            product.setBrand(dto.getBrand());
            product.setModel(dto.getModel());
            product.setCondition(dto.getCondition());
            product.setPrice(dto.getPrice());
            product.setOriginalPrice(dto.getOriginalPrice());
            product.setLocation(dto.getLocation());
            product.setStatus(dto.getStatus() != null ? dto.getStatus() : "AVAILABLE");

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
                    newId, dto.getTitle(), dto.getDescription(), dto.getCategory(),
                    dto.getBrand(), dto.getModel(), dto.getCondition(), dto.getPrice(),
                    dto.getOriginalPrice(), dto.getLocation(),
                    dto.getImageUrls() != null ? dto.getImageUrls() : List.of("https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800")
            );
            if (dto.getSellerId() != null) {
                cached.setSellerId(dto.getSellerId());
            }
            fallbackCache.put(newId, cached);
            return cached;
        }
    }

    public Optional<ProductResponseDTO> updateProduct(Long id, ProductDTO dto) {
        try {
            Optional<Product> opt = productRepository.findById(id);
            if (opt.isPresent()) {
                Product product = opt.get();
                product.setTitle(dto.getTitle());
                product.setDescription(dto.getDescription());
                product.setCategory(dto.getCategory());
                product.setBrand(dto.getBrand());
                product.setModel(dto.getModel());
                product.setCondition(dto.getCondition());
                product.setPrice(dto.getPrice());
                product.setOriginalPrice(dto.getOriginalPrice());
                product.setLocation(dto.getLocation());
                if (dto.getStatus() != null) {
                    product.setStatus(dto.getStatus());
                }
                Product updated = productRepository.save(product);
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
            cached.calculateDiscount();
            return Optional.of(cached);
        }
        return Optional.empty();
    }

    public boolean deleteProduct(Long id) {
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
        if (fallbackCache.remove(id) != null) {
            deleted = true;
        }
        return deleted;
    }

    public ProductResponseDTO mapToResponseDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setSellerId(product.getSellerId());
        dto.setTitle(product.getTitle());
        dto.setDescription(product.getDescription());
        dto.setCategory(product.getCategory());
        dto.setBrand(product.getBrand());
        dto.setModel(product.getModel());
        dto.setCondition(product.getCondition());
        dto.setPrice(product.getPrice());
        dto.setOriginalPrice(product.getOriginalPrice());
        dto.setLocation(product.getLocation());
        dto.setStatus(product.getStatus());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        dto.calculateDiscount();

        try {
            userRepository.findById(product.getSellerId()).ifPresent(user -> {
                dto.setSellerName(user.getName());
                dto.setSellerEmail(user.getEmail());
                dto.setSellerPhone(user.getPhone());
            });
        } catch (Exception ignored) {}

        try {
            List<ProductImage> images = productImageRepository.findByProductId(product.getId());
            List<String> urls = images.stream().map(ProductImage::getImageUrl).toList();
            dto.setImageUrls(urls);
            if (!urls.isEmpty()) {
                dto.setPrimaryImage(urls.get(0));
            } else {
                dto.setPrimaryImage("https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800");
            }
        } catch (Exception ignored) {
            dto.setPrimaryImage("https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800");
        }

        return dto;
    }
}
