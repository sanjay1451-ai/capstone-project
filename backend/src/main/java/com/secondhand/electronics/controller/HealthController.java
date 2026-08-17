package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.HealthResponse;
import com.secondhand.electronics.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    /**
     * Health check endpoint to verify backend status.
     * GET /api/health
     * Returns: {"status": "Backend is running", "environment": "dev", "timestamp": "...", "version": "1.0.0"}
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        HealthResponse response = healthService.checkHealth();
        return ResponseEntity.ok(response);
    }
}
