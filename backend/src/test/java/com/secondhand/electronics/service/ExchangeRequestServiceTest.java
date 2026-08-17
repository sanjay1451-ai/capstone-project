package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.CreateExchangeRequestDTO;
import com.secondhand.electronics.dto.ExchangeResponseDTO;
import com.secondhand.electronics.dto.ProductDTO;
import com.secondhand.electronics.entity.ExchangeRequest;
import com.secondhand.electronics.entity.User;
import com.secondhand.electronics.repository.ExchangeRequestRepository;
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
class ExchangeRequestServiceTest {

    @Mock
    private ExchangeRequestRepository exchangeRequestRepository;

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
    private ExchangeRequestService exchangeRequestService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        productService = new ProductService(productRepository, productImageRepository, userRepository);
        exchangeRequestService = new ExchangeRequestService(exchangeRequestRepository, productService, authService);
    }

    @Test
    @DisplayName("Should successfully submit device exchange request")
    void testCreateExchangeRequestSuccess() {
        User requester = new User("Requester User", "requester@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        requester.setId(20L);

        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));

        // Create target product owned by seller 5L
        ProductDTO p1 = new ProductDTO();
        p1.setSellerId(5L);
        p1.setTitle("MacBook Pro M2");
        p1.setCategory("Laptops");
        p1.setCondition("LIKE_NEW");
        p1.setPrice(new BigDecimal("1299.00"));
        var targetProduct = productService.createProduct(p1);

        // Create offered product owned by requester 20L
        ProductDTO p2 = new ProductDTO();
        p2.setSellerId(20L);
        p2.setTitle("iPad Pro 12.9");
        p2.setCategory("Tablets");
        p2.setCondition("EXCELLENT");
        p2.setPrice(new BigDecimal("799.00"));
        var offeredProduct = productService.createProduct(p2);

        when(exchangeRequestRepository.save(any(ExchangeRequest.class))).thenAnswer(i -> {
            ExchangeRequest ex = i.getArgument(0);
            ex.setId(301L);
            return ex;
        });

        CreateExchangeRequestDTO req = new CreateExchangeRequestDTO(targetProduct.getId(), offeredProduct.getId(), "Can add $200 cash!");
        ExchangeResponseDTO res = exchangeRequestService.createExchangeRequest("requester@example.com", req);

        assertNotNull(res);
        assertEquals(301L, res.getId());
        assertEquals(20L, res.getRequesterId());
        assertEquals("PENDING", res.getStatus());
        assertEquals("MacBook Pro M2", res.getTargetProduct().getTitle());
        assertEquals("iPad Pro 12.9", res.getOfferedProduct().getTitle());
    }

    @Test
    @DisplayName("Should reject exchange when requesting swap on own item")
    void testCreateExchangeOwnItemRejected() {
        User requester = new User("Requester User", "requester@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        requester.setId(20L);

        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));

        ProductDTO p1 = new ProductDTO();
        p1.setSellerId(20L);
        p1.setTitle("MacBook Pro M2");
        p1.setCategory("Laptops");
        p1.setCondition("LIKE_NEW");
        p1.setPrice(new BigDecimal("1299.00"));
        var targetProduct = productService.createProduct(p1);

        ProductDTO p2 = new ProductDTO();
        p2.setSellerId(20L);
        p2.setTitle("iPad Pro 12.9");
        p2.setCategory("Tablets");
        p2.setCondition("EXCELLENT");
        p2.setPrice(new BigDecimal("799.00"));
        var offeredProduct = productService.createProduct(p2);

        CreateExchangeRequestDTO req = new CreateExchangeRequestDTO(targetProduct.getId(), offeredProduct.getId(), "Swap");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> exchangeRequestService.createExchangeRequest("requester@example.com", req));
        assertTrue(ex.getMessage().contains("cannot propose an exchange for your own product"));
    }

    @Test
    @DisplayName("Should reject exchange when offering an item not owned by requester")
    void testCreateExchangeUnownedOfferedItemRejected() {
        User requester = new User("Requester User", "requester@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        requester.setId(20L);

        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));

        ProductDTO p1 = new ProductDTO();
        p1.setSellerId(5L);
        p1.setTitle("MacBook Pro M2");
        p1.setCategory("Laptops");
        p1.setCondition("LIKE_NEW");
        p1.setPrice(new BigDecimal("1299.00"));
        var targetProduct = productService.createProduct(p1);

        ProductDTO p2 = new ProductDTO();
        p2.setSellerId(99L); // stranger owns this device
        p2.setTitle("iPad Pro 12.9");
        p2.setCategory("Tablets");
        p2.setCondition("EXCELLENT");
        p2.setPrice(new BigDecimal("799.00"));
        var offeredProduct = productService.createProduct(p2);

        CreateExchangeRequestDTO req = new CreateExchangeRequestDTO(targetProduct.getId(), offeredProduct.getId(), "Swap");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> exchangeRequestService.createExchangeRequest("requester@example.com", req));
        assertTrue(ex.getMessage().contains("only offer products that you own"));
    }

    @Test
    @DisplayName("Should accept exchange proposal")
    void testAcceptExchangeSuccess() {
        User seller = new User("Seller User", "seller@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        seller.setId(5L);

        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(seller));

        ProductDTO p1 = new ProductDTO();
        p1.setSellerId(5L);
        p1.setTitle("MacBook Pro M2");
        p1.setCategory("Laptops");
        p1.setCondition("LIKE_NEW");
        p1.setPrice(new BigDecimal("1299.00"));
        var targetProduct = productService.createProduct(p1);

        ProductDTO p2 = new ProductDTO();
        p2.setSellerId(20L);
        p2.setTitle("iPad Pro 12.9");
        p2.setCategory("Tablets");
        p2.setCondition("EXCELLENT");
        p2.setPrice(new BigDecimal("799.00"));
        var offeredProduct = productService.createProduct(p2);

        ExchangeRequest ex = new ExchangeRequest();
        ex.setId(401L);
        ex.setRequesterId(20L);
        ex.setProductId(targetProduct.getId());
        ex.setOfferedProductId(offeredProduct.getId());
        ex.setStatus("PENDING");

        when(exchangeRequestRepository.findById(401L)).thenReturn(Optional.of(ex));
        when(exchangeRequestRepository.save(any(ExchangeRequest.class))).thenAnswer(i -> i.getArgument(0));

        ExchangeResponseDTO res = exchangeRequestService.acceptExchange("seller@example.com", 401L);
        assertNotNull(res);
        assertEquals("ACCEPTED", res.getStatus());
    }

    @Test
    @DisplayName("Should reject exchange proposal")
    void testRejectExchangeSuccess() {
        User seller = new User("Seller User", "seller@example.com", "hash", "123", "Main St", null, "ROLE_USER");
        seller.setId(5L);

        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(seller));

        ProductDTO p1 = new ProductDTO();
        p1.setSellerId(5L);
        p1.setTitle("MacBook Pro M2");
        p1.setCategory("Laptops");
        p1.setCondition("LIKE_NEW");
        p1.setPrice(new BigDecimal("1299.00"));
        var targetProduct = productService.createProduct(p1);

        ProductDTO p2 = new ProductDTO();
        p2.setSellerId(20L);
        p2.setTitle("iPad Pro 12.9");
        p2.setCategory("Tablets");
        p2.setCondition("EXCELLENT");
        p2.setPrice(new BigDecimal("799.00"));
        var offeredProduct = productService.createProduct(p2);

        ExchangeRequest ex = new ExchangeRequest();
        ex.setId(402L);
        ex.setRequesterId(20L);
        ex.setProductId(targetProduct.getId());
        ex.setOfferedProductId(offeredProduct.getId());
        ex.setStatus("PENDING");

        when(exchangeRequestRepository.findById(402L)).thenReturn(Optional.of(ex));
        when(exchangeRequestRepository.save(any(ExchangeRequest.class))).thenAnswer(i -> i.getArgument(0));

        ExchangeResponseDTO res = exchangeRequestService.rejectExchange("seller@example.com", 402L);
        assertNotNull(res);
        assertEquals("REJECTED", res.getStatus());
    }
}
