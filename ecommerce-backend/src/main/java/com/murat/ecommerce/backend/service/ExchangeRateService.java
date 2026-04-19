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
    private static final String API_URL = "https://open.er-api.com/v6/latest/USD";
    private static final long CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

    private final RestTemplate restTemplate;
    private ExchangeRateResponseDTO cachedRates;
    private long lastFetchTime = 0;

    public ExchangeRateService() {
        this.restTemplate = new RestTemplate();
    }

    @SuppressWarnings("unchecked")
    public ExchangeRateResponseDTO getExchangeRates() {
        long now = System.currentTimeMillis();

        if (cachedRates != null && (now - lastFetchTime) < CACHE_DURATION_MS) {
            log.info("Döviz kurları cache'den döndürülüyor");
            return cachedRates;
        }

        try {
            Map<String, Object> response = restTemplate.getForObject(API_URL, Map.class);
            Map<String, Number> rates = (Map<String, Number>) response.get("rates");

            double tryRate = rates.get("TRY").doubleValue();
            double eur = rates.get("EUR").doubleValue();
            double gbp = rates.get("GBP").doubleValue();

            ExchangeRateResponseDTO dto = new ExchangeRateResponseDTO();
            dto.setTryRate(tryRate);
            dto.setEur(eur);
            dto.setGbp(gbp);

            cachedRates = dto;
            lastFetchTime = now;

            log.info("Döviz kurları API'den güncellendi - TRY: {}, EUR: {}, GBP: {}", tryRate, eur, gbp);
            return dto;

        } catch (Exception e) {
            log.error("Döviz kuru API'sine erişilemedi, fallback değerler kullanılıyor", e);

            if (cachedRates != null) {
                log.info("Eski cache değerleri döndürülüyor");
                return cachedRates;
            }

            ExchangeRateResponseDTO dto = new ExchangeRateResponseDTO();
            dto.setTryRate(32.5);
            dto.setEur(0.92);
            dto.setGbp(0.79);
            return dto;
        }
    }
}
