package com.murat.ecommerce.backend.service;

import com.murat.ecommerce.backend.dto.CustomerDTO;
import com.murat.ecommerce.backend.entity.Customer;
import com.murat.ecommerce.backend.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    public Customer createCustomer(CustomerDTO dto) {
        if (customerRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }
        Customer customer = toEntity(dto);
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, CustomerDTO dto) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        if (customerRepository.existsByEmail(dto.getEmail())
                && !existing.getEmail().equals(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        applyDto(existing, dto);
        return customerRepository.save(existing);
    }

    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        }
        customerRepository.deleteById(id);
    }

    private static Customer toEntity(CustomerDTO dto) {
        Customer customer = new Customer();
        applyDto(customer, dto);
        return customer;
    }

    private static void applyDto(Customer target, CustomerDTO dto) {
        target.setFirstName(dto.getFirstName());
        target.setLastName(dto.getLastName());
        target.setEmail(dto.getEmail());
        target.setPhone(dto.getPhone());
    }
}
