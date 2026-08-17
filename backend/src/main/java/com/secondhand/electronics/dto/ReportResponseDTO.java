package com.secondhand.electronics.dto;

import java.time.LocalDateTime;

public class ReportResponseDTO {

    private Long id;
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;
    private Long productId;
    private String productTitle;
    private String productCategory;
    private Long sellerId;
    private String sellerName;
    private String reason;
    private String details;
    private String status;
    private LocalDateTime createdAt;

    public ReportResponseDTO() {
    }

    public ReportResponseDTO(Long id, Long reporterId, String reporterName, String reporterEmail, Long productId, String productTitle, String productCategory, Long sellerId, String sellerName, String reason, String details, String status, LocalDateTime createdAt) {
        this.id = id;
        this.reporterId = reporterId;
        this.reporterName = reporterName;
        this.reporterEmail = reporterEmail;
        this.productId = productId;
        this.productTitle = productTitle;
        this.productCategory = productCategory;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.reason = reason;
        this.details = details;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public String getReporterEmail() {
        return reporterEmail;
    }

    public void setReporterEmail(String reporterEmail) {
        this.reporterEmail = reporterEmail;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductTitle() {
        return productTitle;
    }

    public void setProductTitle(String productTitle) {
        this.productTitle = productTitle;
    }

    public String getProductCategory() {
        return productCategory;
    }

    public void setProductCategory(String productCategory) {
        this.productCategory = productCategory;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
