package com.murat.ecommerce.backend.event;

import com.murat.ecommerce.backend.entity.Order;

/**
 * Sipariş oluşturulduğunda fırlatılan olay (Event).
 * Bu sınıf artık sadece bilgilendirme (mail vs.) işlemleri için gerekli verileri taşır.
 */
public class OrderCreatedEvent {
    private final Order order;

    public OrderCreatedEvent(Order order) {
        this.order = order;
    }

    public Order getOrder() {
        return order;
    }
}
