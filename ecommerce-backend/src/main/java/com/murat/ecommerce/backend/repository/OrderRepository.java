package com.murat.ecommerce.backend.repository;

import com.murat.ecommerce.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;



@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser_Email(String email);
}
