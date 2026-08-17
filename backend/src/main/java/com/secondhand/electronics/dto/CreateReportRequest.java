package com.secondhand.electronics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateReportRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Report reason is required")
    private String reason; // 'FAKE_PRODUCT', 'SCAM', 'INCORRECT_INFO', 'INAPPROPRIATE_CONTENT'

    private String details;

    public CreateReportRequest() {
    }

    public CreateReportRequest(Long productId, String reason, String details) {
        this.productId = productId;
        this.reason = reason;
        this.details = details;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
