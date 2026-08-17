package com.secondhand.electronics.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateExchangeStatusDTO {

    @NotBlank(message = "Status is required")
    private String status;

    public UpdateExchangeStatusDTO() {
    }

    public UpdateExchangeStatusDTO(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
