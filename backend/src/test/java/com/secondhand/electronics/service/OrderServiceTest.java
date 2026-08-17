package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.CreateOrderRequest;
import com.secondhand.electronics.dto.OrderResponseDTO;
import com.secondhand.electronics.dto.ProductDTO;
import com.secondhand.electronics.dto.RegisterRequest;
import com.secondhand.electronics.entity.Order;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.OrderRepository;
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

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;
    private ProductService productService;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        productService = new ProductService(productRepository, productImageRepository, userRepository);
        orderService = new OrderService(
                orderRepository,
                productRepository,
                userRepository,
                productService,
                authService
        );
    }

    @Test
    @DisplayName("Should successfully create order and compute total price")
    void testCreateOrderSuccess() {
        User buyerUser = new User("Buyer User", "buyer@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        buyerUser.setId(10L);

        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(buyerUser));

        // Seed product in ProductService
        ProductDTO pDto = new ProductDTO();
        pDto.setSellerId(5L);
        pDto.setTitle("iPhone 14 Pro");
        pDto.setPrice(new BigDecimal("799.00"));
        var createdProduct = productService.createProduct(pDto);
        Long productId = createdProduct.getId();

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(101L);
            return o;
        });

        CreateOrderRequest req = new CreateOrderRequest(productId, 2, "123 Main St", "Call upon arrival");
        OrderResponseDTO orderRes = orderService.createOrder("buyer@example.com", req);

        assertNotNull(orderRes);
        assertEquals(101L, orderRes.getId());
        assertEquals(10L, orderRes.getBuyerId());
        assertEquals("PENDING", orderRes.getOrderStatus());
        assertEquals(2, orderRes.getQuantity());
        assertEquals(new BigDecimal("1598.00"), orderRes.getTotalPrice());
    }

    @Test
    @DisplayName("Should reject order when buyer attempts to purchase own product")
    void testCreateOrderOwnProductRejected() {
        User sellerUser = new User("Seller User", "seller@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        sellerUser.setId(5L);

        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(sellerUser));

        ProductDTO pDto = new ProductDTO();
        pDto.setSellerId(5L);
        pDto.setTitle("iPhone 14 Pro");
        pDto.setPrice(new BigDecimal("799.00"));
        var createdProduct = productService.createProduct(pDto);
        Long productId = createdProduct.getId();

        CreateOrderRequest req = new CreateOrderRequest(productId, 1, "123 Main St", null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> orderService.createOrder("seller@example.com", req));
        assertTrue(ex.getMessage().contains("cannot purchase your own listed product"));
    }

    @Test
    @DisplayName("Should update order status successfully")
    void testUpdateOrderStatus() {
        User sellerUser = new User("Seller User", "seller@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        sellerUser.setId(5L);

        User buyerUser = new User("Buyer User", "buyer@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        buyerUser.setId(10L);

        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(sellerUser));
        when(userRepository.findById(10L)).thenReturn(Optional.of(buyerUser));

        ProductDTO pDto = new ProductDTO();
        pDto.setSellerId(5L);
        pDto.setTitle("iPhone 14 Pro");
        pDto.setPrice(new BigDecimal("799.00"));
        var createdProduct = productService.createProduct(pDto);
        Long productId = createdProduct.getId();

        Order order = new Order();
        order.setId(101L);
        order.setBuyerId(10L);
        order.setProductId(productId);
        order.setOrderStatus("PENDING");
        order.setQuantity(1);
        order.setTotalPrice(new BigDecimal("799.00"));

        when(orderRepository.findById(101L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponseDTO updated = orderService.updateOrderStatus("seller@example.com", 101L, "SHIPPED");

        assertEquals("SHIPPED", updated.getOrderStatus());
    }
}
