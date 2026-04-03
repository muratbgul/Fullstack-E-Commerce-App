package com.murat.ecommerce.backend.repository;

import com.murat.ecommerce.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;



public interface UserRepository extends JpaRepository<User, Long> {

    java.util.List<User> findAllByStatus(String status);
    
    java.util.Optional<User> findByEmailAndStatus(String email, String status);

    boolean existsByEmailAndStatus(String email, String status);
}
