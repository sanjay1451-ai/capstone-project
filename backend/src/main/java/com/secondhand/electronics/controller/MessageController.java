package com.secondhand.electronics.controller;

import com.secondhand.electronics.dto.ApiResponse;
import com.secondhand.electronics.dto.ConversationResponseDTO;
import com.secondhand.electronics.dto.MessageResponseDTO;
import com.secondhand.electronics.dto.SendMessageRequest;
import com.secondhand.electronics.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * POST /api/messages
     * Send a new message or start a conversation
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponseDTO>> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to send messages"));
        }

        try {
            String userEmail = auth.getName();
            MessageResponseDTO sent = messageService.sendMessage(userEmail, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Message sent successfully", sent));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to send message: " + e.getMessage()));
        }
    }

    /**
     * GET /api/messages/conversations
     * List all active conversations for the authenticated user
     */
    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponseDTO>>> getConversations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to view conversations"));
        }

        try {
            String userEmail = auth.getName();
            List<ConversationResponseDTO> conversations = messageService.getConversations(userEmail);
            return ResponseEntity.ok(ApiResponse.success("Conversations retrieved", conversations));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve conversations: " + e.getMessage()));
        }
    }

    /**
     * GET /api/messages/{otherUserId}
     * Get chat history between current user and specified user
     */
    @GetMapping("/{otherUserId}")
    public ResponseEntity<ApiResponse<List<MessageResponseDTO>>> getConversationMessages(@PathVariable Long otherUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please sign in to view chat"));
        }

        try {
            String userEmail = auth.getName();
            List<MessageResponseDTO> messages = messageService.getConversationMessages(userEmail, otherUserId);
            return ResponseEntity.ok(ApiResponse.success("Messages retrieved", messages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve chat messages: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/messages/{otherUserId}/read
     * Mark conversation messages as read
     */
    @PutMapping("/{otherUserId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long otherUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }

        try {
            String userEmail = auth.getName();
            messageService.markConversationAsRead(userEmail, otherUserId);
            return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update read status: " + e.getMessage()));
        }
    }
}
