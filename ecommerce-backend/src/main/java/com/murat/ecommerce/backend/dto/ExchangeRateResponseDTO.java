package com.murat.ecommerce.backend.dto;

import lombok.Data;

@Data
public class ExchangeRateResponseDTO {
    private double tryRate;
    private double eur;
    private double gbp;
}
