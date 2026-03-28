package com.murat.ecommerce.backend.service;

import com.murat.ecommerce.backend.dto.OrderRequestDTO;
import com.murat.ecommerce.backend.entity.Order;
import com.murat.ecommerce.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public Order createOrder(OrderRequestDTO request) {
        Order order = new Order();
        order.setUserEmail(request.getUserEmail());
        order.setTotalPrice(request.getTotalPrice());
        order.setCreatedAt(LocalDateTime.now());
        order.setProductDetails(request.getProductDetails());

        return orderRepository.save(order);
    }

    public List<Order> getOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrders(String email) {
        if (email != null && !email.isEmpty()) {
            return orderRepository.findByUserEmail(email);
        }
        return orderRepository.findAll();
    }
}
