package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.ApiResponse;
import com.secondhand.electronics.dto.CreateOrderRequest;
import com.secondhand.electronics.dto.OrderResponseDTO;
import com.secondhand.electronics.dto.UpdateOrderStatusRequest;
import com.secondhand.electronics.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * POST /api/orders
     * Place a new order to purchase an electronic device
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to place an order"));
        }

        try {
            String userEmail = auth.getName();
            OrderResponseDTO order = orderService.createOrder(userEmail, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Order placed successfully", order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to place order: " + e.getMessage()));
        }
    }

    /**
     * GET /api/orders/{id}
     * Retrieve single order details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderById(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to view this order"));
        }

        try {
            String userEmail = auth.getName();
            return orderService.getOrderById(userEmail, id)
                    .map(order -> ResponseEntity.ok(ApiResponse.success("Order retrieved", order)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.error("Order not found with ID: " + id)));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve order: " + e.getMessage()));
        }
    }

    /**
     * GET /api/orders/my-orders
     * Retrieve all orders placed by the current user
     */
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getMyOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to view your orders"));
        }

        try {
            String userEmail = auth.getName();
            List<OrderResponseDTO> orders = orderService.getMyOrders(userEmail);
            return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve orders: " + e.getMessage()));
        }
    }

    /**
     * GET /api/orders/seller-orders
     * Retrieve all orders received for products listed by the current user
     */
    @GetMapping("/seller-orders")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getSellerOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to view seller orders"));
        }

        try {
            String userEmail = auth.getName();
            List<OrderResponseDTO> orders = orderService.getSellerOrders(userEmail);
            return ResponseEntity.ok(ApiResponse.success("Seller orders retrieved successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve seller orders: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/orders/{id}/status
     * Update order status (e.g. CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to update order status"));
        }

        try {
            String userEmail = auth.getName();
            OrderResponseDTO updated = orderService.updateOrderStatus(userEmail, id, request.getStatus());
            return ResponseEntity.ok(ApiResponse.success("Order status updated to " + request.getStatus(), updated));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update status: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/orders/{id}
     * Cancel or delete order
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to cancel this order"));
        }

        try {
            String userEmail = auth.getName();
            boolean deleted = orderService.deleteOrder(userEmail, id);
            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success("Order removed successfully", null));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Order not found with ID: " + id));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete order: " + e.getMessage()));
        }
    }
}
