package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.ConversationResponseDTO;
import com.secondhand.electronics.dto.MessageResponseDTO;
import com.secondhand.electronics.dto.SendMessageRequest;
import com.secondhand.electronics.entity.Message;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.MessageRepository;
import com.secondhand.electronics.repository.ProductImageRepository;
import com.secondhand.electronics.repository.ProductRepository;
import com.secondhand.electronics.repository.UserRepository;
import com.secondhand.electronics.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;
    private ProductService productService;
    private MessageService messageService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        productService = new ProductService(productRepository, productImageRepository, userRepository);
        messageService = new MessageService(messageRepository, userRepository, authService, productService);
    }

    @Test
    @DisplayName("Should successfully send message between users")
    void testSendMessageSuccess() {
        User sender = new User("Alice Buyer", "alice@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        sender.setId(10L);

        User receiver = new User("Bob Seller", "bob@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        receiver.setId(20L);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sender));

        when(messageRepository.save(any(Message.class))).thenAnswer(i -> {
            Message m = i.getArgument(0);
            m.setId(101L);
            return m;
        });

        SendMessageRequest req = new SendMessageRequest(20L, null, "Hello Bob, is this item negotiable?");
        MessageResponseDTO res = messageService.sendMessage("alice@example.com", req);

        assertNotNull(res);
        assertEquals(101L, res.getId());
        assertEquals(10L, res.getSenderId());
        assertEquals(20L, res.getReceiverId());
        assertEquals("Hello Bob, is this item negotiable?", res.getContent());
    }

    @Test
    @DisplayName("Should reject self-messaging")
    void testSelfMessagingRejected() {
        User user = new User("Alice", "alice@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        user.setId(10L);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        SendMessageRequest req = new SendMessageRequest(10L, null, "Talking to myself");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> messageService.sendMessage("alice@example.com", req));
        assertTrue(ex.getMessage().contains("cannot send messages to yourself"));
    }

    @Test
    @DisplayName("Should retrieve active conversations list")
    void testGetConversations() {
        User user = new User("Alice", "alice@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        user.setId(1L);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        List<ConversationResponseDTO> list = messageService.getConversations("alice@example.com");
        assertNotNull(list);
        assertFalse(list.isEmpty());
    }
}
