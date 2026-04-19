package com.murat.ecommerce.backend.controller;

import com.murat.ecommerce.backend.dto.OrderRequestDTO;
import com.murat.ecommerce.backend.entity.Order;
import com.murat.ecommerce.backend.entity.OrderItem;
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

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public Order createOrder(@RequestBody OrderRequestDTO request) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return orderService.createOrder(request, email);
    }

    @GetMapping
    public List<Order> getMyOrders() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return orderService.getOrders(email);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAllOrdersForAdmin() {
        return orderService.getOrders(null);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public Order cancelOrder(@PathVariable Long id) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        return orderService.cancelOrder(id, email, isAdmin);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Order updateStatus(@PathVariable Long id, @RequestParam String status) {
        return orderService.updateOrderStatus(id, status);
    }

    @PutMapping("/{id}/request-return")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public Order requestReturn(@PathVariable Long id, @RequestBody List<Long> itemIds) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return orderService.requestReturn(id, email, itemIds);
    }

    @PutMapping("/{id}/approve-return")
    @PreAuthorize("hasRole('ADMIN')")
    public Order approveReturn(@PathVariable Long id) {
        return orderService.approveReturn(id);
    }

    @PutMapping("/items/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public OrderItem refundOrderItem(@PathVariable Long id) {
        return orderService.refundOrderItem(id);
    }
}
