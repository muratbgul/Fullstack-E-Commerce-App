package com.murat.ecommerce.backend.repository;

import com.murat.ecommerce.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    java.util.List<Product> findAllByStatus(String status);
    java.util.Optional<Product> findByIdAndStatus(Long id, String status);
}
