package com.murat.ecommerce.backend.config;

import com.murat.ecommerce.backend.entity.Product;
import com.murat.ecommerce.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner loadData(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                Product p1 = new Product();
                p1.setName("iPhone 15 Pro");
                p1.setPrice(1299.99);

                Product p2 = new Product();
                p2.setName("MacBook Pro M3");
                p2.setPrice(2499.00);

                Product p3 = new Product();
                p3.setName("AirPods Pro 2");
                p3.setPrice(249.00);

                Product p4 = new Product();
                p4.setName("Samsung Galaxy S24 Ultra");
                p4.setPrice(1199.99);

                Product p5 = new Product();
                p5.setName("Sony WH-1000XM5");
                p5.setPrice(348.00);

                Product p6 = new Product();
                p6.setName("Logitech MX Master 3S");
                p6.setPrice(99.00);

                productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));

                System.out.println("Sample products have been successfully inserted into the database!");
            }
        };
    }
}
