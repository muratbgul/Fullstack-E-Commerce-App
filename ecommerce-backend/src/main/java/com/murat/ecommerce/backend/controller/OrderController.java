package com.murat.ecommerce.backend.controller;

import com.murat.ecommerce.backend.dto.OrderRequestDTO;
import com.murat.ecommerce.backend.entity.Order;
import com.murat.ecommerce.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public Order createOrder(@RequestBody OrderRequestDTO request) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        request.setUserEmail(email); // Override with secure email from JWT
        return orderService.createOrder(request);
    }

    @GetMapping
    public List<Order> getOrders() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return orderService.getOrders(email);
    }
}
