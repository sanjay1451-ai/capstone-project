package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.CreateOrderRequest;
import com.secondhand.electronics.dto.OrderResponseDTO;
import com.secondhand.electronics.dto.ProductResponseDTO;
import com.secondhand.electronics.entity.Order;
import com.secondhand.electronics.entity.Product;
import com.secondhand.electronics.repository.OrderRepository;
import com.secondhand.electronics.repository.ProductRepository;
import com.secondhand.electronics.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final AuthService authService;

    // Resilient fallback storage for offline / dev demo mode
    private final Map<Long, Order> fallbackOrders = new ConcurrentHashMap<>();
    private final AtomicLong orderIdGen = new AtomicLong(100);

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            ProductService productService,
            AuthService authService
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productService = productService;
        this.authService = authService;
    }

    public OrderResponseDTO createOrder(String userEmail, CreateOrderRequest request) {
        var userDto = authService.getCurrentUser(userEmail);
        Long buyerId = userDto.getId();

        ProductResponseDTO productDto = productService.getProductById(request.getProductId()).orElse(null);
        if (productDto == null) {
            throw new IllegalArgumentException("Product not found with ID: " + request.getProductId());
        }

        if (productDto.getSellerId() != null && productDto.getSellerId().equals(buyerId)) {
            throw new IllegalArgumentException("You cannot purchase your own listed product.");
        }

        int quantity = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;
        BigDecimal price = productDto.getPrice() != null ? productDto.getPrice() : BigDecimal.ZERO;
        BigDecimal totalPrice = price.multiply(BigDecimal.valueOf(quantity));

        Order order = new Order();
        order.setBuyerId(buyerId);
        order.setProductId(request.getProductId());
        order.setQuantity(quantity);
        order.setTotalPrice(totalPrice);
        order.setOrderStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = null;
        try {
            savedOrder = orderRepository.save(order);
        } catch (Exception ignored) {
            // fallback
        }

        if (savedOrder == null) {
            order.setId(orderIdGen.incrementAndGet());
            savedOrder = order;
        }
        fallbackOrders.put(savedOrder.getId(), savedOrder);

        return mapToOrderResponse(savedOrder, productDto, userDto.getName(), userDto.getEmail());
    }

    public List<OrderResponseDTO> getMyOrders(String userEmail) {
        var userDto = authService.getCurrentUser(userEmail);
        Long buyerId = userDto.getId();

        List<Order> orders = new ArrayList<>();
        try {
            orders = orderRepository.findByBuyerId(buyerId);
        } catch (Exception ignored) {
            // DB unreachable
        }

        if (orders.isEmpty()) {
            orders = fallbackOrders.values().stream()
                    .filter(o -> o.getBuyerId() != null && o.getBuyerId().equals(buyerId))
                    .collect(Collectors.toList());
        }

        return orders.stream()
                .map(o -> {
                    ProductResponseDTO p = productService.getProductById(o.getProductId()).orElse(null);
                    return mapToOrderResponse(o, p, userDto.getName(), userDto.getEmail());
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<OrderResponseDTO> getSellerOrders(String userEmail) {
        var userDto = authService.getCurrentUser(userEmail);
        Long sellerId = userDto.getId();

        List<Order> allOrders = new ArrayList<>();
        try {
            allOrders = orderRepository.findAll();
        } catch (Exception ignored) {
            // DB unreachable
        }

        if (allOrders.isEmpty()) {
            allOrders = new ArrayList<>(fallbackOrders.values());
        }

        return allOrders.stream()
                .filter(o -> {
                    try {
                        ProductResponseDTO p = productService.getProductById(o.getProductId()).orElse(null);
                        return p != null && p.getSellerId() != null && p.getSellerId().equals(sellerId);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .map(o -> {
                    ProductResponseDTO p = productService.getProductById(o.getProductId()).orElse(null);
                    String buyerName = "Customer";
                    String buyerEmail = "customer@volttrade.com";
                    try {
                        var buyer = authService.getUserById(o.getBuyerId());
                        if (buyer != null) {
                            buyerName = buyer.getName();
                            buyerEmail = buyer.getEmail();
                        }
                    } catch (Exception ignored) {}
                    return mapToOrderResponse(o, p, buyerName, buyerEmail);
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public OrderResponseDTO updateOrderStatus(String userEmail, Long orderId, String status) {
        var userDto = authService.getCurrentUser(userEmail);

        Order order = null;
        try {
            order = orderRepository.findById(orderId).orElse(null);
        } catch (Exception ignored) {
            // DB unreachable
        }

        if (order == null) {
            order = fallbackOrders.get(orderId);
        }

        if (order == null) {
            throw new IllegalArgumentException("Order with ID " + orderId + " not found");
        }

        ProductResponseDTO productDto = productService.getProductById(order.getProductId()).orElse(null);

        // Verify that user is either the seller, the buyer (for cancellation), or an admin
        boolean isSeller = productDto != null && productDto.getSellerId() != null && productDto.getSellerId().equals(userDto.getId());
        boolean isBuyer = order.getBuyerId().equals(userDto.getId());
        boolean isAdmin = "ROLE_ADMIN".equals(userDto.getRole());

        if (!isSeller && !isBuyer && !isAdmin) {
            throw new IllegalArgumentException("You are not authorized to update this order's status.");
        }

        order.setOrderStatus(status.toUpperCase());

        Order saved = order;
        try {
            saved = orderRepository.save(order);
        } catch (Exception ignored) {}

        fallbackOrders.put(saved.getId(), saved);

        String buyerName = "Customer";
        String buyerEmail = "customer@volttrade.com";
        try {
            var buyer = authService.getUserById(saved.getBuyerId());
            if (buyer != null) {
                buyerName = buyer.getName();
                buyerEmail = buyer.getEmail();
            }
        } catch (Exception ignored) {}

        return mapToOrderResponse(saved, productDto, buyerName, buyerEmail);
    }

    private OrderResponseDTO mapToOrderResponse(Order order, ProductResponseDTO product, String buyerName, String buyerEmail) {
        Long sellerId = product != null ? product.getSellerId() : null;
        String sellerName = product != null && product.getSellerName() != null ? product.getSellerName() : "VoltTrade Merchant";

        return new OrderResponseDTO(
                order.getId(),
                order.getBuyerId(),
                buyerName,
                buyerEmail,
                sellerId,
                sellerName,
                product,
                order.getQuantity(),
                order.getTotalPrice(),
                order.getOrderStatus(),
                order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now()
        );
    }
}
