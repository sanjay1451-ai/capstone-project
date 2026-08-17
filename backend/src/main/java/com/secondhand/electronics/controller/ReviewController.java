package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.ApiResponse;
import com.secondhand.electronics.dto.CreateReviewRequest;
import com.secondhand.electronics.dto.ReviewResponseDTO;
import com.secondhand.electronics.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * POST /api/reviews
     * Post a rating (1-5) and feedback review
     */
    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> postReview(@Valid @RequestBody Map<String, Object> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to submit a review"));
        }

        try {
            Long productId = Long.valueOf(body.get("productId").toString());
            int rating = Integer.parseInt(body.get("rating").toString());
            String comment = body.get("comment") != null ? body.get("comment").toString() : "";

            CreateReviewRequest req = new CreateReviewRequest(rating, comment);
            String userEmail = auth.getName();
            ReviewResponseDTO res = reviewService.addReview(userEmail, productId, req);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Review submitted successfully", res));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to submit review: " + e.getMessage()));
        }
    }

    /**
     * POST /api/products/{productId}/reviews
     * Post a rating (1-5) and feedback review for a specific product
     */
    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to submit a review"));
        }

        try {
            String userEmail = auth.getName();
            ReviewResponseDTO res = reviewService.addReview(userEmail, productId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Review submitted successfully", res));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to submit review: " + e.getMessage()));
        }
    }

    /**
     * GET /api/reviews/product/{productId}
     * Retrieve all reviews for a product
     */
    @GetMapping({"/reviews/product/{productId}", "/products/{productId}/reviews"})
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getProductReviews(@PathVariable Long productId) {
        try {
            List<ReviewResponseDTO> reviews = reviewService.getProductReviews(productId);
            return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviews));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve reviews: " + e.getMessage()));
        }
    }

    /**
     * GET /api/reviews/seller/{sellerId}
     * Retrieve all reviews received by a seller across all products
     */
    @GetMapping("/reviews/seller/{sellerId}")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getSellerReviews(@PathVariable Long sellerId) {
        try {
            List<ReviewResponseDTO> reviews = reviewService.getSellerReviews(sellerId);
            return ResponseEntity.ok(ApiResponse.success("Seller reviews retrieved", reviews));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve seller reviews: " + e.getMessage()));
        }
    }

    /**
     * GET /api/reviews/my-reviews
     * Retrieve all reviews written by the authenticated user
     */
    @GetMapping("/reviews/my-reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getMyReviews() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to view your reviews"));
        }

        try {
            String userEmail = auth.getName();
            List<ReviewResponseDTO> reviews = reviewService.getMyReviews(userEmail);
            return ResponseEntity.ok(ApiResponse.success("Your reviews retrieved", reviews));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve your reviews: " + e.getMessage()));
        }
    }

    /**
     * GET /api/products/{productId}/rating-summary
     * Retrieve average star rating and review count
     */
    @GetMapping("/products/{productId}/rating-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRatingSummary(@PathVariable Long productId) {
        try {
            Map<String, Object> summary = reviewService.getProductRatingSummary(productId);
            return ResponseEntity.ok(ApiResponse.success("Rating summary retrieved", summary));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve rating summary: " + e.getMessage()));
        }
    }
}
