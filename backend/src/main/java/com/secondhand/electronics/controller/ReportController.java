package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.ApiResponse;
import com.secondhand.electronics.dto.CreateReportRequest;
import com.secondhand.electronics.dto.ReportResponseDTO;
import com.secondhand.electronics.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * POST /api/reports
     * Flag or report a suspicious or inappropriate product listing
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponseDTO>> submitReport(@Valid @RequestBody CreateReportRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to report a listing"));
        }

        try {
            String userEmail = auth.getName();
            ReportResponseDTO report = reportService.submitReport(userEmail, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Report submitted for moderation review", report));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to submit report: " + e.getMessage()));
        }
    }

    /**
     * GET /api/reports/my-reports
     * Retrieve all reports filed by the authenticated user
     */
    @GetMapping("/my-reports")
    public ResponseEntity<ApiResponse<List<ReportResponseDTO>>> getMyReports() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }

        try {
            String userEmail = auth.getName();
            List<ReportResponseDTO> list = reportService.getMyReports(userEmail);
            return ResponseEntity.ok(ApiResponse.success("My reports retrieved", list));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve reports: " + e.getMessage()));
        }
    }
}
