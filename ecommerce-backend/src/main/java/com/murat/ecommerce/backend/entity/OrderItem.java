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
    private BigDecimal priceAtOrder; // Saving the price at the time of order

    @Column(name = "product_name_at_order")
    private String productNameAtOrder; // Saving the product name at the time of order (For data integrity)

    @Column(name = "status")
    private String status = "PAID"; // Default status: PAID (PAID, REFUNDED)

    @Column(name = "payment_transaction_id")
    private String paymentTransactionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    /**
     * Returns the product name for the frontend.
     */
    @JsonProperty("productName")
    public String getProductName() {
        if (productNameAtOrder != null)
            return productNameAtOrder;
        return product != null ? product.getName() : "Unknown Product";
    }
}
