package com.murat.ecommerce.backend.service;

import com.murat.ecommerce.backend.entity.Product;
import com.murat.ecommerce.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;



@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    @Cacheable("products")
    public List<Product> getAllProducts() {
        log.info("********** [DB] ÜRÜNLER VERİ TABANINDAN ÇEKİLİYOR **********");
        return productRepository.findAllByStatus("ACTIVE");
    }

    public List<Product> getAllProductsForAdmin() {
        return productRepository.findAll();
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product createProduct(Product product) {
        product.setStatus("ACTIVE");
        return productRepository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = productRepository.findByIdAndStatus(id, "ACTIVE")
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Ürün bulunamadı"));
        
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStock(updatedProduct.getStock());
        
        return productRepository.save(existingProduct);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        Product existingProduct = productRepository.findByIdAndStatus(id, "ACTIVE")
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Ürün bulunamadı"));
        
        existingProduct.setStatus("DELETED");
        productRepository.save(existingProduct);
    }
}
