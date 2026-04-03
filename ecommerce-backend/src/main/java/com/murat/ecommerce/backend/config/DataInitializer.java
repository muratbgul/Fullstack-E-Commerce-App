package com.murat.ecommerce.backend.config;

import com.murat.ecommerce.backend.repository.OrderRepository;
import com.murat.ecommerce.backend.entity.Product;
import com.murat.ecommerce.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.ArrayList;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner loadData(ProductRepository productRepository, OrderRepository orderRepository, com.murat.ecommerce.backend.repository.UserRepository userRepository, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            // Eski 'deleted' sütununu temizleme işlemi artık gerekli değil çünkü tablo sıfırdan oluşuyor.
            
            if (productRepository.count() == 0) {
                String[] categories = {"iPhone", "Samsung", "MacBook", "Asus", "Sony", "Logitech", "HP", "Dell", "Xiaomi", "Google"};
                String[] models = {"Pro", "Ultra", "Slim", "Pro Max", "Air", "Gaming", "Elite", "Standard", "Studio", "Lite"};
                String[] items = {"15", "14", "13", "S24", "S23", "Z Fold", "Surface", "ZenBook", "Vostro", "XPS"};

                List<Product> sampleProducts = new ArrayList<>();
                
                // Temel popüler ürünler
                sampleProducts.add(new Product(null, "iPhone 15 Pro Max", new BigDecimal("1399.00"), 50));
                sampleProducts.add(new Product(null, "Samsung S24 Ultra", new BigDecimal("1199.00"), 45));
                sampleProducts.add(new Product(null, "MacBook Pro M3 Max", new BigDecimal("3499.00"), 20));
                sampleProducts.add(new Product(null, "Sony WH-1000XM5", new BigDecimal("349.00"), 100));
                sampleProducts.add(new Product(null, "AirPods Pro 2", new BigDecimal("249.00"), 150));
                sampleProducts.add(new Product(null, "PS5 Slim Edition", new BigDecimal("499.00"), 40));

                // 50'ye tamamlayan rastgele ama mantıklı ürünler
                for (int i = 1; i <= 44; i++) {
                    String cat = categories[i % categories.length];
                    String mod = models[i % models.length];
                    String itm = items[i % items.length];
                    
                    String name = cat + " " + itm + " " + mod + " " + (i + 100);
                    // Rastgele ama mantıklı fiyat (10.0 ile 3000.0 arası)
                    double price = 25.0 + (Math.random() * 2800.0);
                    // Rastgele ama mantıklı stok (10 ile 200 arası)
                    int stock = 10 + (int)(Math.random() * 190);
                    
                    BigDecimal bdPrice = BigDecimal.valueOf(price).setScale(2, RoundingMode.HALF_UP);
                    sampleProducts.add(new Product(null, name, bdPrice, stock));
                }

                productRepository.saveAll(sampleProducts);
                System.out.println("50 sample products with logical prices & stocks inserted!");
            }
        };
    }
}
