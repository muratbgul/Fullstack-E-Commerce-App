package com.murat.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {
    private PaymentCardRequestDTO paymentCard;
    private List<OrderItemRequestDTO> items;
    private BuyerInfoDTO buyerInfo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequestDTO {
        private Long productId;
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BuyerInfoDTO {
        private String name;
        private String surname;
        private String phone;
        private String address;
    }
}
