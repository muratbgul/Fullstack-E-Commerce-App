package com.murat.ecommerce.backend.service;

import com.murat.ecommerce.backend.dto.OrderRequestDTO;
import com.murat.ecommerce.backend.entity.Order;
import com.murat.ecommerce.backend.entity.OrderItem;
import com.murat.ecommerce.backend.entity.Product;
import com.murat.ecommerce.backend.entity.User;
import com.murat.ecommerce.backend.repository.OrderRepository;
import com.murat.ecommerce.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserService userService;
    private final ProductRepository productRepository;

    /**
     * Siparişi oluşturur, stok kontrolü yapar ve bakiyeyi günceller.
     */
    @Transactional
    public Order createOrder(OrderRequestDTO request, String email) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sipariş en az bir ürün içermelidir.");
        }

        User user = userService.getUserByEmail(email);
        
        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("ACTIVE");

        BigDecimal totalOrderPrice = BigDecimal.ZERO;

        for (OrderRequestDTO.OrderItemRequestDTO itemDTO : request.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Ürün bulunamadı: " + itemDTO.getProductId()));

            // Stok kontrolü
            if (product.getStock() < itemDTO.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Yetersiz stok: " + product.getName() + " (Mevcut: " + product.getStock() + ")");
            }

            // Stok düşme
            product.setStock(product.getStock() - itemDTO.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPriceAtOrder(product.getPrice());
            orderItem.setProductNameAtOrder(product.getName());
            
            order.addItem(orderItem);
            totalOrderPrice = totalOrderPrice.add(product.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
        }

        order.setTotalPrice(totalOrderPrice);
        Order savedOrder = orderRepository.save(order);
        userService.addSpentAmount(email, totalOrderPrice);
        return savedOrder;
    }

    public List<Order> getOrders(String email) {
        if (email != null && !email.isEmpty()) {
            return orderRepository.findByUser_Email(email);
        }
        return orderRepository.findAll();
    }

    /**
     * Siparişi iptal eder, iade yapar ve stoğu geri yükler.
     */
    @Transactional
    public Order cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sipariş bulunamadı"));
        
        if ("CANCELLED".equals(order.getStatus())) {
            return order;
        }

        // Stoğu geri yükle
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus("CANCELLED");
        userService.subtractSpentAmount(order.getUserEmail(), order.getTotalPrice());
        return orderRepository.save(order);
    }
}
