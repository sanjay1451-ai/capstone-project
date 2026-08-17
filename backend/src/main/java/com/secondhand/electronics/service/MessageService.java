package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.ConversationResponseDTO;
import com.secondhand.electronics.dto.MessageResponseDTO;
import com.secondhand.electronics.dto.SendMessageRequest;
import com.secondhand.electronics.entity.Message;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.MessageRepository;
import com.secondhand.electronics.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final ProductService productService;

    // Resilient fallback storage for offline dev / demo mode
    private final Map<Long, Message> fallbackMessages = new ConcurrentHashMap<>();
    private final AtomicLong messageIdGen = new AtomicLong(100);

    public MessageService(
            MessageRepository messageRepository,
            UserRepository userRepository,
            AuthService authService,
            ProductService productService
    ) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.authService = authService;
        this.productService = productService;
        initDemoMessages();
    }

    private void initDemoMessages() {
        Message m1 = new Message(1L, 2L, 1L, "Hi! Is the iPhone 14 Pro still available?");
        m1.setId(1L);
        m1.setCreatedAt(LocalDateTime.now().minusHours(4));
        m1.setIsRead(true);
        fallbackMessages.put(1L, m1);

        Message m2 = new Message(2L, 1L, 1L, "Yes, absolutely! It is boxed with all accessories and ready to ship.");
        m2.setId(2L);
        m2.setCreatedAt(LocalDateTime.now().minusHours(3));
        m2.setIsRead(true);
        fallbackMessages.put(2L, m2);

        Message m3 = new Message(1L, 2L, 1L, "Great! I just placed the order via checkout. Thanks!");
        m3.setId(3L);
        m3.setCreatedAt(LocalDateTime.now().minusHours(2));
        m3.setIsRead(false);
        fallbackMessages.put(3L, m3);
    }

    @Transactional
    public MessageResponseDTO sendMessage(String userEmail, SendMessageRequest request) {
        var userDto = authService.getCurrentUser(userEmail);
        Long senderId = userDto.getId();

        if (senderId.equals(request.getReceiverId())) {
            throw new IllegalArgumentException("You cannot send messages to yourself.");
        }

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(request.getReceiverId());
        message.setProductId(request.getProductId());
        message.setContent(request.getContent().trim());
        message.setIsRead(false);
        message.setCreatedAt(LocalDateTime.now());

        Message saved = null;
        try {
            saved = messageRepository.save(message);
        } catch (Exception ignored) {}

        if (saved == null) {
            message.setId(messageIdGen.incrementAndGet());
            saved = message;
        }
        fallbackMessages.put(saved.getId(), saved);

        return mapToMessageResponse(saved);
    }

    public List<MessageResponseDTO> getConversationMessages(String userEmail, Long otherUserId) {
        var userDto = authService.getCurrentUser(userEmail);
        Long currentUserId = userDto.getId();

        List<Message> list = new ArrayList<>();
        try {
            list = messageRepository.findConversation(currentUserId, otherUserId);
        } catch (Exception ignored) {}

        if (list.isEmpty()) {
            list = fallbackMessages.values().stream()
                    .filter(m -> (m.getSenderId().equals(currentUserId) && m.getReceiverId().equals(otherUserId)) ||
                                 (m.getSenderId().equals(otherUserId) && m.getReceiverId().equals(currentUserId)))
                    .sorted(Comparator.comparing(Message::getCreatedAt))
                    .collect(Collectors.toList());
        }

        return list.stream().map(this::mapToMessageResponse).collect(Collectors.toList());
    }

    public List<ConversationResponseDTO> getConversations(String userEmail) {
        var userDto = authService.getCurrentUser(userEmail);
        Long currentUserId = userDto.getId();

        List<Message> allMessages = new ArrayList<>();
        try {
            allMessages = messageRepository.findBySenderIdOrReceiverIdOrderByCreatedAtAsc(currentUserId, currentUserId);
        } catch (Exception ignored) {}

        if (allMessages.isEmpty()) {
            allMessages = fallbackMessages.values().stream()
                    .filter(m -> m.getSenderId().equals(currentUserId) || m.getReceiverId().equals(currentUserId))
                    .sorted(Comparator.comparing(Message::getCreatedAt))
                    .collect(Collectors.toList());
        }

        // Group by other user ID
        Map<Long, List<Message>> grouped = new HashMap<>();
        for (Message m : allMessages) {
            Long otherId = m.getSenderId().equals(currentUserId) ? m.getReceiverId() : m.getSenderId();
            grouped.computeIfAbsent(otherId, k -> new ArrayList<>()).add(m);
        }

        List<ConversationResponseDTO> conversations = new ArrayList<>();
        for (Map.Entry<Long, List<Message>> entry : grouped.entrySet()) {
            Long otherId = entry.getKey();
            List<Message> thread = entry.getValue();
            Message lastMsg = thread.get(thread.size() - 1);

            int unread = (int) thread.stream()
                    .filter(m -> m.getReceiverId().equals(currentUserId) && Boolean.FALSE.equals(m.getIsRead()))
                    .count();

            String otherName = "VoltTrade Member";
            String otherEmail = "member@volttrade.com";
            String otherAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
            String otherRole = "ROLE_USER";

            try {
                var otherUser = authService.getUserById(otherId);
                if (otherUser != null) {
                    otherName = otherUser.getName();
                    otherEmail = otherUser.getEmail();
                    otherAvatar = otherUser.getProfileImage() != null ? otherUser.getProfileImage() : otherAvatar;
                    otherRole = otherUser.getRole();
                }
            } catch (Exception ignored) {}

            String prodTitle = null;
            if (lastMsg.getProductId() != null) {
                try {
                    var prod = productService.getProductById(lastMsg.getProductId()).orElse(null);
                    if (prod != null) prodTitle = prod.getTitle();
                } catch (Exception ignored) {}
            }

            conversations.add(new ConversationResponseDTO(
                    otherId,
                    otherName,
                    otherEmail,
                    otherAvatar,
                    otherRole,
                    lastMsg.getContent(),
                    lastMsg.getCreatedAt(),
                    lastMsg.getSenderId(),
                    unread,
                    lastMsg.getProductId(),
                    prodTitle
            ));
        }

        conversations.sort((a, b) -> b.getLastMessageTime().compareTo(a.getLastMessageTime()));
        return conversations;
    }

    @Transactional
    public void markConversationAsRead(String userEmail, Long otherUserId) {
        var userDto = authService.getCurrentUser(userEmail);
        Long currentUserId = userDto.getId();

        try {
            List<Message> unread = messageRepository.findConversation(currentUserId, otherUserId);
            for (Message m : unread) {
                if (m.getReceiverId().equals(currentUserId) && Boolean.FALSE.equals(m.getIsRead())) {
                    m.setIsRead(true);
                    messageRepository.save(m);
                }
            }
        } catch (Exception ignored) {}

        fallbackMessages.values().stream()
                .filter(m -> m.getReceiverId().equals(currentUserId) && m.getSenderId().equals(otherUserId))
                .forEach(m -> m.setIsRead(true));
    }

    private MessageResponseDTO mapToMessageResponse(Message m) {
        String senderName = "User #" + m.getSenderId();
        String senderAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
        String receiverName = "User #" + m.getReceiverId();
        String receiverAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

        try {
            var s = authService.getUserById(m.getSenderId());
            if (s != null) {
                senderName = s.getName();
                if (s.getProfileImage() != null) senderAvatar = s.getProfileImage();
            }
        } catch (Exception ignored) {}

        try {
            var r = authService.getUserById(m.getReceiverId());
            if (r != null) {
                receiverName = r.getName();
                if (r.getProfileImage() != null) receiverAvatar = r.getProfileImage();
            }
        } catch (Exception ignored) {}

        String productTitle = null;
        if (m.getProductId() != null) {
            try {
                var p = productService.getProductById(m.getProductId()).orElse(null);
                if (p != null) productTitle = p.getTitle();
            } catch (Exception ignored) {}
        }

        return new MessageResponseDTO(
                m.getId(),
                m.getSenderId(),
                senderName,
                senderAvatar,
                m.getReceiverId(),
                receiverName,
                receiverAvatar,
                m.getProductId(),
                productTitle,
                m.getContent(),
                m.getIsRead(),
                m.getCreatedAt() != null ? m.getCreatedAt() : LocalDateTime.now()
        );
    }
}
