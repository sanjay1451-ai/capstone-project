package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.ProductImageDTO;
import com.secondhand.electronics.entity.Product;
import com.secondhand.electronics.entity.ProductImage;
import com.secondhand.electronics.repository.ProductImageRepository;
import com.secondhand.electronics.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final ConcurrentHashMap<Long, ProductImageDTO> fallbackImageCache = new ConcurrentHashMap<>();
    private final AtomicLong imageIdGen = new AtomicLong(100);

    public ProductImageService(ProductImageRepository productImageRepository, ProductRepository productRepository) {
        this.productImageRepository = productImageRepository;
        this.productRepository = productRepository;
    }

    public List<ProductImageDTO> getImagesByProductId(Long productId) {
        try {
            List<ProductImage> dbImages = productImageRepository.findByProductId(productId);
            if (!dbImages.isEmpty()) {
                return dbImages.stream().map(this::mapToDTO).toList();
            }
        } catch (Exception ignored) {
            // DB unreachable
        }
        return fallbackImageCache.values().stream()
                .filter(img -> img.getProductId().equals(productId))
                .toList();
    }

    public Optional<ProductImageDTO> addImageToProduct(Long productId, String imageUrl) {
        try {
            Optional<Product> opt = productRepository.findById(productId);
            if (opt.isPresent()) {
                ProductImage img = new ProductImage(opt.get(), imageUrl);
                ProductImage saved = productImageRepository.save(img);
                return Optional.of(mapToDTO(saved));
            }
        } catch (Exception ignored) {
            // DB unreachable
        }

        Long newId = imageIdGen.incrementAndGet();
        ProductImageDTO cached = new ProductImageDTO(newId, productId, imageUrl);
        fallbackImageCache.put(newId, cached);
        return Optional.of(cached);
    }

    public boolean deleteImage(Long id) {
        boolean deleted = false;
        try {
            if (productImageRepository.existsById(id)) {
                productImageRepository.deleteById(id);
                deleted = true;
            }
        } catch (Exception ignored) {
            // DB unreachable
        }
        if (fallbackImageCache.remove(id) != null) {
            deleted = true;
        }
        return deleted;
    }

    private ProductImageDTO mapToDTO(ProductImage image) {
        return new ProductImageDTO(
                image.getId(),
                image.getProduct().getId(),
                image.getImageUrl()
        );
    }
}
