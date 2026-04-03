package com.murat.ecommerce.backend.controller;

import com.murat.ecommerce.backend.entity.Product;
import com.murat.ecommerce.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;



@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @org.springframework.web.bind.annotation.PostMapping
    public Product createProduct(@org.springframework.web.bind.annotation.RequestBody Product product) {
        return productService.createProduct(product);
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public Product updateProduct(@org.springframework.web.bind.annotation.PathVariable Long id, @org.springframework.web.bind.annotation.RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public void deleteProduct(@org.springframework.web.bind.annotation.PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
