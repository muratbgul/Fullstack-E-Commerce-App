package com.murat.ecommerce.backend.controller;

import com.murat.ecommerce.backend.dto.ExchangeRateResponseDTO;
import com.murat.ecommerce.backend.service.ExchangeRateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin("localhost:3000")
@RestController
@RequestMapping("/exchange-rates")
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    public ExchangeRateController(ExchangeRateService exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }

    @GetMapping
    public ResponseEntity<ExchangeRateResponseDTO> getExchangeRates() {
        return ResponseEntity.ok(exchangeRateService.getExchangeRates());
    }
}
