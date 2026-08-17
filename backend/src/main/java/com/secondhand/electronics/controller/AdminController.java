package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.*;
import com.secondhand.electronics.service.AdminService;
import com.secondhand.electronics.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;

    public AdminController(AdminService adminService, AuthService authService) {
        this.adminService = adminService;
        this.authService = authService;
    }

    private void checkAdminAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new SecurityException("Unauthorized: Authentication required");
        }

        String userEmail = auth.getName();
        var user = authService.getCurrentUser(userEmail);
        if (user == null || !"ROLE_ADMIN".equals(user.getRole())) {
            throw new SecurityException("Access Denied: Administrator privileges required");
        }
    }

    /**
     * GET /api/admin/stats
     * Retrieve platform-wide metrics & KPI counters
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDTO>> getStats() {
        try {
            checkAdminAccess();
            AdminStatsDTO stats = adminService.getAdminStats();
            return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved", stats));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve stats: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/users
     * List / search all registered users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getUsers(
            @RequestParam(required = false) String search
    ) {
        try {
            checkAdminAccess();
            List<UserResponseDTO> users = adminService.getAllUsers(search);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve users: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/users/{id}/status
     * Activate or suspend a user account
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            checkAdminAccess();
            String status = body.getOrDefault("status", "ACTIVE");
            UserResponseDTO updated = adminService.updateUserStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("User status updated to " + status, updated));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update user status: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/products
     * List / search all products for moderation
     */
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        try {
            checkAdminAccess();
            List<ProductResponseDTO> products = adminService.getAllProducts(search, status);
            return ResponseEntity.ok(ApiResponse.success("Products retrieved", products));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve products: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/products/{id}/status
     * Change product listing status
     */
    @PutMapping("/products/{id}/status")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> updateProductStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            checkAdminAccess();
            String status = body.getOrDefault("status", "AVAILABLE");
            ProductResponseDTO updated = adminService.updateProductStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Product status updated to " + status, updated));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update product status: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/products/{id}
     * Remove / delete inappropriate product listing
     */
    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        try {
            checkAdminAccess();
            boolean deleted = adminService.deleteProduct(id);
            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success("Listing removed successfully", null));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Product not found with ID: " + id));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to remove product: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/reports
     * List all flagged / reported product listings
     */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<ReportResponseDTO>>> getReports() {
        try {
            checkAdminAccess();
            List<ReportResponseDTO> reports = adminService.getAllReports();
            return ResponseEntity.ok(ApiResponse.success("Reports retrieved", reports));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve reports: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/reports/{id}/status
     * Resolve or dismiss a flagged product report
     */
    @PutMapping("/reports/{id}/status")
    public ResponseEntity<ApiResponse<ReportResponseDTO>> updateReportStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            checkAdminAccess();
            String status = body.getOrDefault("status", "RESOLVED");
            ReportResponseDTO updated = adminService.updateReportStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Report marked as " + status, updated));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update report status: " + e.getMessage()));
        }
    }
}
