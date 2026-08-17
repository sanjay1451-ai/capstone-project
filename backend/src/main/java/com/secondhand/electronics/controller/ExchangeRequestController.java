package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.ApiResponse;
import com.secondhand.electronics.dto.CreateExchangeRequestDTO;
import com.secondhand.electronics.dto.ExchangeResponseDTO;
import com.secondhand.electronics.dto.UpdateExchangeStatusDTO;
import com.secondhand.electronics.service.ExchangeRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exchanges")
public class ExchangeRequestController {

    private final ExchangeRequestService exchangeService;

    public ExchangeRequestController(ExchangeRequestService exchangeService) {
        this.exchangeService = exchangeService;
    }

    /**
     * POST /api/exchanges
     * Propose a device barter / swap offer
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ExchangeResponseDTO>> createExchange(
            @Valid @RequestBody CreateExchangeRequestDTO request
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to propose an exchange"));
        }

        try {
            String userEmail = auth.getName();
            ExchangeResponseDTO res = exchangeService.createExchangeRequest(userEmail, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Exchange proposal submitted successfully", res));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create exchange request: " + e.getMessage()));
        }
    }

    /**
     * GET /api/exchanges/sent
     * Retrieve all exchange proposals submitted by current user
     */
    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<List<ExchangeResponseDTO>>> getSentExchanges() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to view sent exchanges"));
        }

        try {
            String userEmail = auth.getName();
            List<ExchangeResponseDTO> list = exchangeService.getSentRequests(userEmail);
            return ResponseEntity.ok(ApiResponse.success("Sent exchange proposals retrieved", list));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve exchanges: " + e.getMessage()));
        }
    }

    /**
     * GET /api/exchanges/received
     * Retrieve all exchange proposals received for user's listed products
     */
    @GetMapping("/received")
    public ResponseEntity<ApiResponse<List<ExchangeResponseDTO>>> getReceivedExchanges() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to view received exchanges"));
        }

        try {
            String userEmail = auth.getName();
            List<ExchangeResponseDTO> list = exchangeService.getReceivedRequests(userEmail);
            return ResponseEntity.ok(ApiResponse.success("Received exchange proposals retrieved", list));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve exchanges: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/exchanges/{id}/status
     * Update exchange proposal status (ACCEPTED, REJECTED, CANCELLED)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ExchangeResponseDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExchangeStatusDTO request
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to update exchange status"));
        }

        try {
            String userEmail = auth.getName();
            ExchangeResponseDTO updated = exchangeService.updateStatus(userEmail, id, request.getStatus());
            return ResponseEntity.ok(ApiResponse.success("Exchange proposal status updated", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update status: " + e.getMessage()));
        }
    }
}
