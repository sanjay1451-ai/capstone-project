package com.secondhand.electronics.dto;

import java.time.LocalDateTime;

public class ExchangeResponseDTO {

    private Long id;
    private Long requesterId;
    private String requesterName;
    private String requesterEmail;
    private ProductResponseDTO targetProduct;
    private ProductResponseDTO offeredProduct;
    private String message;
    private String status;
    private LocalDateTime createdAt;

    public ExchangeResponseDTO() {
    }

    public ExchangeResponseDTO(Long id, Long requesterId, String requesterName, String requesterEmail, ProductResponseDTO targetProduct, ProductResponseDTO offeredProduct, String message, String status, LocalDateTime createdAt) {
        this.id = id;
        this.requesterId = requesterId;
        this.requesterName = requesterName;
        this.requesterEmail = requesterEmail;
        this.targetProduct = targetProduct;
        this.offeredProduct = offeredProduct;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public ProductResponseDTO getTargetProduct() {
        return targetProduct;
    }

    public void setTargetProduct(ProductResponseDTO targetProduct) {
        this.targetProduct = targetProduct;
    }

    public ProductResponseDTO getOfferedProduct() {
        return offeredProduct;
    }

    public void setOfferedProduct(ProductResponseDTO offeredProduct) {
        this.offeredProduct = offeredProduct;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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
