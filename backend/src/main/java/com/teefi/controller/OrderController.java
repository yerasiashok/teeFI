package com.teefi.controller;

import com.teefi.dto.request.CheckoutRequest;
import com.teefi.dto.response.OrderResponse;
import com.teefi.dto.response.PaymentInitResponse;
import com.teefi.service.impl.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<PaymentInitResponse> checkout(@AuthenticationPrincipal UserDetails user,
                                                         @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(orderService.checkout(user.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserDetails user,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getUserOrders(user.getUsername(), page, size));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrder(@AuthenticationPrincipal UserDetails user,
                                                   @PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber, user.getUsername()));
    }
}
