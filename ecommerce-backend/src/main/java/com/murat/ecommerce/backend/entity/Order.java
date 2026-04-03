package com.murat.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";

    @Column(nullable = false)
    private LocalDateTime createdAt;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @com.fasterxml.jackson.annotation.JsonProperty("userEmail")
    public String getUserEmail() {
        return user != null ? user.getEmail() : null;
    }

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    // Helper method to add item
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
