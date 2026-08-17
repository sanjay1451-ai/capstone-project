package com.secondhand.electronics.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateExchangeRequestDTO {

    @NotNull(message = "Target product ID is required")
    private Long productId;

    @NotNull(message = "Offered product ID is required")
    private Long offeredProductId;

    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;

    public CreateExchangeRequestDTO() {
    }

    public CreateExchangeRequestDTO(Long productId, Long offeredProductId, String message) {
        this.productId = productId;
        this.offeredProductId = offeredProductId;
        this.message = message;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getOfferedProductId() {
        return offeredProductId;
    }

    public void setOfferedProductId(Long offeredProductId) {
        this.offeredProductId = offeredProductId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
