package com.murat.ecommerce.backend;

import com.murat.ecommerce.backend.entity.Product;
import com.murat.ecommerce.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Bean
	CommandLineRunner runner(ProductRepository repository) {
		return args -> {
			if (repository.count() == 0) {
				List<Product> products = Arrays.asList(
						new Product(null, "iPhone 15 Pro", 75000.0),
						new Product(null, "MacBook Pro M3", 95000.0),
						new Product(null, "Logitech MX Master 3S", 3500.0),
						new Product(null, "Mechanical Keyboard", 2500.0),
						new Product(null, "Dell 27\" 4K Monitor", 12000.0),
						new Product(null, "iPad Air", 28000.0),
						new Product(null, "Sony WH-1000XM5", 11000.0),
						new Product(null, "Canon EOS R5", 145000.0),
						new Product(null, "Apple Watch Series 9", 16000.0),
						new Product(null, "Samsung Galaxy S24 Ultra", 70000.0),
						new Product(null, "AirPods Pro", 8000.0),
						new Product(null, "Gaming Mouse Pad", 600.0),
						new Product(null, "USB-C Hub", 1500.0),
						new Product(null, "Portable SSD 1TB", 4500.0),
						new Product(null, "Webcam 4K", 3800.0),
						new Product(null, "Gaming Chair", 12000.0),
						new Product(null, "Desk Lamp Pro", 1200.0),
						new Product(null, "Microphone Yeti", 6500.0),
						new Product(null, "Wireless Charger", 800.0),
						new Product(null, "Bluetooth Speaker", 2200.0)
				);
				repository.saveAll(products);
				System.out.println("20 sample products saved to database!");
			}
		};
	}

}
