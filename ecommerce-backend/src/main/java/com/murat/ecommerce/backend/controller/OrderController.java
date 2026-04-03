package com.murat.ecommerce.backend.controller;

import com.murat.ecommerce.backend.dto.OrderRequestDTO;
import com.murat.ecommerce.backend.entity.Order;
import com.murat.ecommerce.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    /**
     * Sipariş oluştururken artık totalPrice client'tan beklenmez, 
     * sadece ürün listesi (items) yeterlidir.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public Order createOrder(@RequestBody OrderRequestDTO request) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return orderService.createOrder(request, email);
    }

    @GetMapping
    public List<Order> getOrders() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        String email = isAdmin ? null : (String) auth.getPrincipal();
        return orderService.getOrders(email);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public Order cancelOrder(@PathVariable Long id) {
        return orderService.cancelOrder(id);
    }
}
