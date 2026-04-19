package com.murat.ecommerce.backend.service;

import com.iyzipay.Options;
import com.iyzipay.model.*;
import com.iyzipay.request.CreatePaymentRequest;
import com.iyzipay.request.CreateCancelRequest;
import com.iyzipay.request.CreateRefundRequest;
import com.murat.ecommerce.backend.dto.PaymentCardRequestDTO;
import com.murat.ecommerce.backend.entity.OrderItem;
import com.murat.ecommerce.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.murat.ecommerce.backend.dto.OrderRequestDTO;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class IyzicoPaymentService {

    @Autowired
    private Options options;

    public Payment processPayment(PaymentCardRequestDTO cardDTO, List<OrderItem> items, User user,
            BigDecimal totalPrice, OrderRequestDTO.BuyerInfoDTO requestBuyerInfo) {

        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setLocale(Locale.TR.getValue());
        request.setConversationId(UUID.randomUUID().toString());
        request.setPrice(totalPrice);
        request.setPaidPrice(totalPrice);
        request.setCurrency(Currency.TRY.name());
        request.setInstallment(1);
        request.setBasketId(UUID.randomUUID().toString());
        request.setPaymentChannel(PaymentChannel.WEB.name());
        request.setPaymentGroup(PaymentGroup.PRODUCT.name());

        PaymentCard paymentCard = new PaymentCard();
        paymentCard.setCardHolderName(cardDTO.getCardHolderName());
        paymentCard.setCardNumber(cardDTO.getCardNumber());
        paymentCard.setExpireMonth(cardDTO.getExpireMonth());
        paymentCard.setExpireYear(cardDTO.getExpireYear());
        paymentCard.setCvc(cardDTO.getCvc());
        paymentCard.setRegisterCard(0);
        request.setPaymentCard(paymentCard);

        String buyerName = (requestBuyerInfo != null && requestBuyerInfo.getName() != null && !requestBuyerInfo.getName().trim().isEmpty()) 
            ? requestBuyerInfo.getName().trim() 
            : (user.getName() != null && !user.getName().isEmpty() ? user.getName() : "Customer");
            
        String buyerSurname = (requestBuyerInfo != null && requestBuyerInfo.getSurname() != null && !requestBuyerInfo.getSurname().trim().isEmpty()) 
            ? requestBuyerInfo.getSurname().trim() 
            : (user.getSurname() != null && !user.getSurname().isEmpty() ? user.getSurname() : "Customer");
            
        String buyerPhone = (requestBuyerInfo != null && requestBuyerInfo.getPhone() != null && !requestBuyerInfo.getPhone().trim().isEmpty()) 
            ? requestBuyerInfo.getPhone().trim() 
            : (user.getPhone() != null && !user.getPhone().isEmpty() ? user.getPhone() : "+905350000000");
            
        String buyerAddress = (requestBuyerInfo != null && requestBuyerInfo.getAddress() != null && !requestBuyerInfo.getAddress().trim().isEmpty()) 
            ? requestBuyerInfo.getAddress().trim() 
            : (user.getAddress() != null && !user.getAddress().isEmpty() ? user.getAddress() : "Adres belirtilmedi");

        Buyer buyer = new Buyer();
        buyer.setId(user.getId().toString());
        buyer.setName(buyerName);
        buyer.setSurname(buyerSurname);
        buyer.setGsmNumber(buyerPhone);
        buyer.setEmail(user.getEmail());
        buyer.setIdentityNumber("74300864791");
        buyer.setLastLoginDate("2024-01-01 12:00:00");
        buyer.setRegistrationDate("2024-01-01 12:00:00");
        buyer.setRegistrationAddress(buyerAddress);
        buyer.setIp("85.34.78.112");
        buyer.setCity("Istanbul");
        buyer.setCountry("Turkey");
        buyer.setZipCode("34732");
        request.setBuyer(buyer);

        String contactFullName = buyerName + " " + buyerSurname;

        Address shippingAddress = new Address();
        shippingAddress.setContactName(contactFullName);
        shippingAddress.setCity("Istanbul");
        shippingAddress.setCountry("Turkey");
        shippingAddress.setAddress(buyerAddress);
        shippingAddress.setZipCode("34732");
        request.setShippingAddress(shippingAddress);

        Address billingAddress = new Address();
        billingAddress.setContactName(contactFullName);
        billingAddress.setCity("Istanbul");
        billingAddress.setCountry("Turkey");
        billingAddress.setAddress(buyerAddress);
        billingAddress.setZipCode("34732");
        request.setBillingAddress(billingAddress);

        List<BasketItem> basketItems = new ArrayList<>();
        for (OrderItem item : items) {
            BasketItem basketItem = new BasketItem();
            basketItem.setId(
                    item.getProduct() != null ? item.getProduct().getId().toString() : UUID.randomUUID().toString());
            basketItem.setName(item.getProductNameAtOrder());
            basketItem.setCategory1("E-Commerce");
            basketItem.setItemType(BasketItemType.PHYSICAL.name());
            basketItem.setPrice(item.getPriceAtOrder().multiply(BigDecimal.valueOf(item.getQuantity())));
            basketItems.add(basketItem);
        }
        request.setBasketItems(basketItems);

        return Payment.create(request, options);
    }


    public Cancel cancelPayment(String paymentId) {
        CreateCancelRequest request = new CreateCancelRequest();
        request.setLocale(Locale.TR.getValue());
        request.setConversationId(UUID.randomUUID().toString());
        request.setPaymentId(paymentId);
        request.setIp("127.0.0.1");

        return Cancel.create(request, options);
    }


    public Refund refundProduct(String paymentTransactionId, BigDecimal price) {
        CreateRefundRequest request = new CreateRefundRequest();
        request.setLocale(Locale.TR.getValue());
        request.setConversationId(UUID.randomUUID().toString());
        request.setPaymentTransactionId(paymentTransactionId);
        request.setPrice(price);
        request.setIp("127.0.0.1");
        request.setCurrency(Currency.TRY.name());

        return Refund.create(request, options);
    }
}
