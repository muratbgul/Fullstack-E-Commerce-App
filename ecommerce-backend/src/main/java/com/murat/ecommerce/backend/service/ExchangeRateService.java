package com.murat.ecommerce.backend.service;

import com.murat.ecommerce.backend.dto.ExchangeRateResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ExchangeRateService {

    private static final Logger log = LoggerFactory.getLogger(ExchangeRateService.class);
    private static final String API_URL = "https://open.er-api.com/v6/latest/TRY";
    private static final long CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 saat

    private final RestTemplate restTemplate;
    private ExchangeRateResponseDTO cachedRates;
    private long lastFetchTime = 0;

    public ExchangeRateService() {
        this.restTemplate = new RestTemplate();
    }

    @SuppressWarnings("unchecked")
    public ExchangeRateResponseDTO getExchangeRates() {
        long now = System.currentTimeMillis();

        // Cache hala geçerliyse, cachedRates'i dön
        if (cachedRates != null && (now - lastFetchTime) < CACHE_DURATION_MS) {
            log.info("Döviz kurları cache'den döndürülüyor");
            return cachedRates;
        }

        try {
            Map<String, Object> response = restTemplate.getForObject(API_URL, Map.class);
            Map<String, Number> rates = (Map<String, Number>) response.get("rates");

            double usd = 1.0 / rates.get("USD").doubleValue();
            double eur = 1.0 / rates.get("EUR").doubleValue();
            double gbp = 1.0 / rates.get("GBP").doubleValue();

            ExchangeRateResponseDTO dto = new ExchangeRateResponseDTO();
            dto.setUsd(usd);
            dto.setEur(eur);
            dto.setGbp(gbp);

            // Cache'i güncelle
            cachedRates = dto;
            lastFetchTime = now;

            log.info("Döviz kurları API'den güncellendi - USD: {}, EUR: {}, GBP: {}", usd, eur, gbp);
            return dto;

        } catch (Exception e) {
            log.error("Döviz kuru API'sine erişilemedi, fallback değerler kullanılıyor", e);

            // Eski cache varsa onu dön
            if (cachedRates != null) {
                log.info("Eski cache değerleri döndürülüyor");
                return cachedRates;
            }

            // Hiç cache yoksa fallback
            ExchangeRateResponseDTO dto = new ExchangeRateResponseDTO();
            dto.setUsd(32.0);
            dto.setEur(34.0);
            dto.setGbp(40.0);
            return dto;
        }
    }
}
