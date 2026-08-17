package com.secondhand.electronics.dto;

import java.time.LocalDateTime;

public class ConversationResponseDTO {

    private Long otherUserId;
    private String otherUserName;
    private String otherUserEmail;
    private String otherUserAvatar;
    private String otherUserRole;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long lastMessageSenderId;
    private int unreadCount;
    private Long lastProductId;
    private String lastProductTitle;

    public ConversationResponseDTO() {
    }

    public ConversationResponseDTO(Long otherUserId, String otherUserName, String otherUserEmail, String otherUserAvatar, String otherUserRole, String lastMessage, LocalDateTime lastMessageTime, Long lastMessageSenderId, int unreadCount, Long lastProductId, String lastProductTitle) {
        this.otherUserId = otherUserId;
        this.otherUserName = otherUserName;
        this.otherUserEmail = otherUserEmail;
        this.otherUserAvatar = otherUserAvatar;
        this.otherUserRole = otherUserRole;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.lastMessageSenderId = lastMessageSenderId;
        this.unreadCount = unreadCount;
        this.lastProductId = lastProductId;
        this.lastProductTitle = lastProductTitle;
    }

    public Long getOtherUserId() {
        return otherUserId;
    }

    public void setOtherUserId(Long otherUserId) {
        this.otherUserId = otherUserId;
    }

    public String getOtherUserName() {
        return otherUserName;
    }

    public void setOtherUserName(String otherUserName) {
        this.otherUserName = otherUserName;
    }

    public String getOtherUserEmail() {
        return otherUserEmail;
    }

    public void setOtherUserEmail(String otherUserEmail) {
        this.otherUserEmail = otherUserEmail;
    }

    public String getOtherUserAvatar() {
        return otherUserAvatar;
    }

    public void setOtherUserAvatar(String otherUserAvatar) {
        this.otherUserAvatar = otherUserAvatar;
    }

    public String getOtherUserRole() {
        return otherUserRole;
    }

    public void setOtherUserRole(String otherUserRole) {
        this.otherUserRole = otherUserRole;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public Long getLastMessageSenderId() {
        return lastMessageSenderId;
    }

    public void setLastMessageSenderId(Long lastMessageSenderId) {
        this.lastMessageSenderId = lastMessageSenderId;
    }

    public int getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(int unreadCount) {
        this.unreadCount = unreadCount;
    }

    public Long getLastProductId() {
        return lastProductId;
    }

    public void setLastProductId(Long lastProductId) {
        this.lastProductId = lastProductId;
    }

    public String getLastProductTitle() {
        return lastProductTitle;
    }

    public void setLastProductTitle(String lastProductTitle) {
        this.lastProductTitle = lastProductTitle;
    }
}
