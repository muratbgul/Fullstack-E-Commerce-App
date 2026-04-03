package com.murat.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtOrder; // Sipariş anındaki fiyatı saklıyoruz

    @Column(name = "product_name_at_order")
    private String productNameAtOrder; // Sipariş anındaki ürün adını saklıyoruz (Veri bütünlüğü için)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    /**
     * Frontend için ürün adını döndürür.
     */
    @JsonProperty("productName")
    public String getProductName() {
        if (productNameAtOrder != null)
            return productNameAtOrder;
        return product != null ? product.getName() : "Unknown Product";
    }
}
