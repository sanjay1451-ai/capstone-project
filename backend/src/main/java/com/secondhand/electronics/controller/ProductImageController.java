package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.ApiResponse;
import com.secondhand.electronics.dto.ProductImageDTO;
import com.secondhand.electronics.service.ProductImageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductImageController {

    private final ProductImageService productImageService;

    public ProductImageController(ProductImageService productImageService) {
        this.productImageService = productImageService;
    }

    /**
     * GET /api/products/{productId}/images
     * Get all images for a product
     */
    @GetMapping("/products/{productId}/images")
    public ResponseEntity<ApiResponse<List<ProductImageDTO>>> getProductImages(@PathVariable Long productId) {
        List<ProductImageDTO> images = productImageService.getImagesByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Product images retrieved", images));
    }

    /**
     * POST /api/products/{productId}/images
     * Attach an image to a product
     */
    @PostMapping("/products/{productId}/images")
    public ResponseEntity<ApiResponse<ProductImageDTO>> addProductImage(
            @PathVariable Long productId,
            @RequestBody Map<String, String> payload
    ) {
        String imageUrl = payload.get("imageUrl");
        if (imageUrl == null || imageUrl.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Field 'imageUrl' is required"));
        }

        return productImageService.addImageToProduct(productId, imageUrl)
                .map(img -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.success("Image added to product", img)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product not found with ID: " + productId)));
    }

    /**
     * DELETE /api/images/{id}
     * Remove an image by ID
     */
    @DeleteMapping("/images/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id) {
        boolean deleted = productImageService.deleteImage(id);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Image not found with ID: " + id));
    }
}
