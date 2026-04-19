package com.murat.ecommerce.backend.dto;

import lombok.Data;

@Data
public class IyzicoPaymentRequestDTO {
    private String cardHolderName;
    private String cardNumber;
    private String expireMonth;
    private String expireYear;
    private String cvc;
    private Long productId;
    private Integer quantity;
}
