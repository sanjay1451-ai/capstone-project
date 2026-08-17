package com.secondhand.electronics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SendMessageRequest {

    @NotNull(message = "Receiver ID is required")
    private Long receiverId;

    private Long productId;

    @NotBlank(message = "Message content cannot be empty")
    private String content;

    public SendMessageRequest() {
    }

    public SendMessageRequest(Long receiverId, Long productId, String content) {
        this.receiverId = receiverId;
        this.productId = productId;
        this.content = content;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
