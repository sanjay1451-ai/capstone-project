package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.CreateExchangeRequestDTO;
import com.secondhand.electronics.dto.ExchangeResponseDTO;
import com.secondhand.electronics.dto.ProductResponseDTO;
import com.secondhand.electronics.entity.ExchangeRequest;
import com.secondhand.electronics.repository.ExchangeRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class ExchangeRequestService {

    private final ExchangeRequestRepository exchangeRequestRepository;
    private final ProductService productService;
    private final AuthService authService;

    // Resilient fallback cache
    private final Map<Long, ExchangeRequest> fallbackExchanges = new ConcurrentHashMap<>();
    private final AtomicLong exchangeIdGen = new AtomicLong(200);

    public ExchangeRequestService(
            ExchangeRequestRepository exchangeRequestRepository,
            ProductService productService,
            AuthService authService
    ) {
        this.exchangeRequestRepository = exchangeRequestRepository;
        this.productService = productService;
        this.authService = authService;
    }

    public ExchangeResponseDTO createExchangeRequest(String userEmail, CreateExchangeRequestDTO request) {
        var userDto = authService.getCurrentUser(userEmail);
        Long requesterId = userDto.getId();

        ProductResponseDTO targetProduct = productService.getProductById(request.getProductId()).orElse(null);
        ProductResponseDTO offeredProduct = productService.getProductById(request.getOfferedProductId()).orElse(null);

        if (targetProduct == null || offeredProduct == null) {
            throw new IllegalArgumentException("Target or offered product not found.");
        }

        if (targetProduct.getSellerId() != null && targetProduct.getSellerId().equals(requesterId)) {
            throw new IllegalArgumentException("You cannot propose an exchange for your own product.");
        }

        ExchangeRequest exchange = new ExchangeRequest();
        exchange.setRequesterId(requesterId);
        exchange.setProductId(request.getProductId());
        exchange.setOfferedProductId(request.getOfferedProductId());
        exchange.setMessage(request.getMessage() != null ? request.getMessage().trim() : "");
        exchange.setStatus("PENDING");
        exchange.setCreatedAt(LocalDateTime.now());

        ExchangeRequest saved = null;
        try {
            saved = exchangeRequestRepository.save(exchange);
        } catch (Exception ignored) {}

        if (saved == null) {
            exchange.setId(exchangeIdGen.incrementAndGet());
            saved = exchange;
        }
        fallbackExchanges.put(saved.getId(), saved);

        return mapToExchangeResponse(saved, targetProduct, offeredProduct, userDto.getName(), userDto.getEmail());
    }

    public List<ExchangeResponseDTO> getSentRequests(String userEmail) {
        var userDto = authService.getCurrentUser(userEmail);
        Long requesterId = userDto.getId();

        List<ExchangeRequest> list = new ArrayList<>();
        try {
            list = exchangeRequestRepository.findByRequesterId(requesterId);
        } catch (Exception ignored) {}

        if (list.isEmpty()) {
            list = fallbackExchanges.values().stream()
                    .filter(e -> e.getRequesterId() != null && e.getRequesterId().equals(requesterId))
                    .collect(Collectors.toList());
        }

        return list.stream()
                .map(e -> {
                    ProductResponseDTO target = productService.getProductById(e.getProductId()).orElse(null);
                    ProductResponseDTO offered = productService.getProductById(e.getOfferedProductId()).orElse(null);
                    return mapToExchangeResponse(e, target, offered, userDto.getName(), userDto.getEmail());
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<ExchangeResponseDTO> getReceivedRequests(String userEmail) {
        var userDto = authService.getCurrentUser(userEmail);
        Long myUserId = userDto.getId();

        List<ExchangeRequest> all = new ArrayList<>();
        try {
            all = exchangeRequestRepository.findAll();
        } catch (Exception ignored) {}

        if (all.isEmpty()) {
            all = new ArrayList<>(fallbackExchanges.values());
        }

        return all.stream()
                .filter(e -> {
                    try {
                        ProductResponseDTO target = productService.getProductById(e.getProductId()).orElse(null);
                        return target != null && target.getSellerId() != null && target.getSellerId().equals(myUserId);
                    } catch (Exception ex) {
                        return false;
                    }
                })
                .map(e -> {
                    ProductResponseDTO target = productService.getProductById(e.getProductId()).orElse(null);
                    ProductResponseDTO offered = productService.getProductById(e.getOfferedProductId()).orElse(null);
                    String senderName = "Trader";
                    String senderEmail = "trader@volttrade.com";
                    try {
                        var sender = authService.getUserById(e.getRequesterId());
                        if (sender != null) {
                            senderName = sender.getName();
                            senderEmail = sender.getEmail();
                        }
                    } catch (Exception ignored) {}
                    return mapToExchangeResponse(e, target, offered, senderName, senderEmail);
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public ExchangeResponseDTO updateStatus(String userEmail, Long exchangeId, String status) {
        var userDto = authService.getCurrentUser(userEmail);

        ExchangeRequest exchange = null;
        try {
            exchange = exchangeRequestRepository.findById(exchangeId).orElse(null);
        } catch (Exception ignored) {}

        if (exchange == null) {
            exchange = fallbackExchanges.get(exchangeId);
        }

        if (exchange == null) {
            throw new IllegalArgumentException("Exchange request with ID " + exchangeId + " not found");
        }

        exchange.setStatus(status.toUpperCase());

        ExchangeRequest saved = exchange;
        try {
            saved = exchangeRequestRepository.save(exchange);
        } catch (Exception ignored) {}

        fallbackExchanges.put(saved.getId(), saved);

        ProductResponseDTO target = productService.getProductById(saved.getProductId()).orElse(null);
        ProductResponseDTO offered = productService.getProductById(saved.getOfferedProductId()).orElse(null);
        
        String senderName = "Trader";
        String senderEmail = "trader@volttrade.com";
        try {
            var sender = authService.getUserById(saved.getRequesterId());
            if (sender != null) {
                senderName = sender.getName();
                senderEmail = sender.getEmail();
            }
        } catch (Exception ignored) {}

        return mapToExchangeResponse(saved, target, offered, senderName, senderEmail);
    }

    private ExchangeResponseDTO mapToExchangeResponse(
            ExchangeRequest req,
            ProductResponseDTO target,
            ProductResponseDTO offered,
            String requesterName,
            String requesterEmail
    ) {
        return new ExchangeResponseDTO(
                req.getId(),
                req.getRequesterId(),
                requesterName,
                requesterEmail,
                target,
                offered,
                req.getMessage(),
                req.getStatus(),
                req.getCreatedAt() != null ? req.getCreatedAt() : LocalDateTime.now()
        );
    }
}
