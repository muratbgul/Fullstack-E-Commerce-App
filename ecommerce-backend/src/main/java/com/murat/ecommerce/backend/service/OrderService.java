package com.murat.ecommerce.backend.service;

import com.murat.ecommerce.backend.dto.OrderRequestDTO;
import com.murat.ecommerce.backend.entity.Order;
import com.murat.ecommerce.backend.entity.OrderItem;
import com.murat.ecommerce.backend.entity.Product;
import com.murat.ecommerce.backend.entity.User;
import com.murat.ecommerce.backend.repository.OrderRepository;
import com.murat.ecommerce.backend.repository.ProductRepository;
import com.murat.ecommerce.backend.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import com.murat.ecommerce.backend.event.OrderCreatedEvent;
import org.springframework.web.server.ResponseStatusException;
import com.iyzipay.model.Payment;
import com.iyzipay.model.PaymentItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserService userService;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final IyzicoPaymentService iyzicoPaymentService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Order createOrder(OrderRequestDTO request, String email) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sipariş en az bir ürün içermelidir.");
        }

        User user = userService.getUserByEmail(email);

        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("PENDING");

        BigDecimal totalOrderPrice = BigDecimal.ZERO;

        for (OrderRequestDTO.OrderItemRequestDTO itemDTO : request.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Ürün bulunamadı: " + itemDTO.getProductId()));

            if (product.getStock() < itemDTO.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Yetersiz stok: " + product.getName() + " (Mevcut: " + product.getStock() + ")");
            }

            product.setStock(product.getStock() - itemDTO.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPriceAtOrder(product.getPrice());
            orderItem.setProductNameAtOrder(product.getName());

            order.addItem(orderItem);
            totalOrderPrice = totalOrderPrice
                    .add(product.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
        }

        order.setTotalPrice(totalOrderPrice);

        if (request.getBuyerInfo() != null) {
            order.setBuyerName(request.getBuyerInfo().getName());
            order.setBuyerSurname(request.getBuyerInfo().getSurname());
            order.setBuyerPhone(request.getBuyerInfo().getPhone());
            order.setBuyerAddress(request.getBuyerInfo().getAddress());
        } else {
            order.setBuyerName(user.getName());
            order.setBuyerSurname(user.getSurname());
            order.setBuyerPhone(user.getPhone());
            order.setBuyerAddress(user.getAddress());
        }

        if (request.getPaymentCard() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ödeme bilgileri eksik.");
        }

        log.info("Sipariş için ödeme işlemi başlatılıyor...");

        try {
            Payment payment = iyzicoPaymentService.processPayment(
                    request.getPaymentCard(),
                    order.getItems(),
                    user,
                    order.getTotalPrice(),
                    request.getBuyerInfo());

            if (!"success".equals(payment.getStatus())) {
                log.error("Ödeme başarısız: {}, Kullanıcı: {}", payment.getErrorMessage(), email);
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ödeme hatası: " + payment.getErrorMessage());
            }

            order.setStatus("PENDING");
            order.setPaymentId(payment.getPaymentId());

            if (payment.getPaymentItems() != null) {
                for (PaymentItem iyzicoItem : payment.getPaymentItems()) {
                    String basketItemId = iyzicoItem.getItemId();
                    order.getItems().stream()
                            .filter(oi -> oi.getProduct() != null
                                    && oi.getProduct().getId().toString().equals(basketItemId))
                            .findFirst()
                            .ifPresent(oi -> oi.setPaymentTransactionId(iyzicoItem.getPaymentTransactionId()));
                }
            }

            Order savedOrder = orderRepository.save(order);

            userService.addSpentAmount(email, order.getTotalPrice());

            log.info("Sipariş ve ödeme başarıyla tamamlandı. Order ID: {}", savedOrder.getId());

            eventPublisher.publishEvent(new OrderCreatedEvent(savedOrder));

            return savedOrder;

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Sipariş oluşturma sırasında beklenmedik hata", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Sistem hatası: " + e.getMessage());
        }
    }

    public List<Order> getOrders(String email) {
        if (email != null && !email.isEmpty()) {
            return orderRepository.findByUser_Email(email);
        }
        return orderRepository.findAll();
    }

    @Transactional
    public Order cancelOrder(Long id, String email, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sipariş bulunamadı"));

        if (!isAdmin && !order.getUserEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu işlem için yetkiniz yok.");
        }

        if ("CANCELLED".equals(order.getStatus())) {
            return order;
        }

        if (!isAdmin && !"PENDING".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Sadece beklemedeki (PENDING) siparişler iptal edilebilir.");
        }

        if (order.getPaymentId() != null && !order.getPaymentId().isEmpty()) {
            com.iyzipay.model.Cancel iyzicoCancel = iyzicoPaymentService.cancelPayment(order.getPaymentId());

            if (!"success".equals(iyzicoCancel.getStatus())) {
                // Not: "Tutar iade edilmiş" veya "zaten iptal edilmiş" gibi durumlar da error
                // dönebilir,
                // onları burada spesifik yönetebilirsin. Şimdilik hata fırlatıyoruz.
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Iyzico iptal hatası: " + iyzicoCancel.getErrorMessage());
            }
        }

        // Stoğu geri yükle
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus("CANCELLED");
        userService.subtractSpentAmount(order.getUserEmail(), order.getTotalPrice());
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long id, String newStatus) {
        String status = newStatus.toUpperCase();

        if ("CANCELLED".equals(status)) {
            return cancelOrder(id, null, true);
        }

        if ("REFUNDED".equals(status)) {
            return approveReturn(id);
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sipariş bulunamadı"));

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public Order requestReturn(Long id, String email, List<Long> itemIds) {
        if (itemIds == null || itemIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "İade edilecek en az bir ürün seçilmelidir.");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sipariş bulunamadı"));

        if (!order.getUserEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu sipariş size ait değil.");
        }

        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())
                && !"PARTIALLY_REFUNDED".equalsIgnoreCase(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Sadece teslim edilmiş siparişler için iade talebi oluşturulabilir.");
        }

        boolean updatedAny = false;
        for (OrderItem item : order.getItems()) {
            if (itemIds.contains(item.getId()) && "PAID".equals(item.getStatus())) {
                item.setStatus("RETURN_REQUESTED");
                updatedAny = true;
            }
        }

        if (!updatedAny) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "İade edilebilir bir ürün seçilmedi.");
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order approveReturn(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sipariş bulunamadı"));

        if (!"RETURN_REQUESTED".equalsIgnoreCase(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "İade edilecek bir talep bulunamadı.");
        }

        for (OrderItem item : order.getItems()) {
            if (item.getPaymentTransactionId() != null) {
                BigDecimal refundAmount = item.getPriceAtOrder().multiply(BigDecimal.valueOf(item.getQuantity()));
                com.iyzipay.model.Refund iyzicoRefund = iyzicoPaymentService
                        .refundProduct(item.getPaymentTransactionId(), refundAmount);

                if (!"success".equals(iyzicoRefund.getStatus())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Iyzico iade hatası (Ürün ID: " + item.getId() + "): " + iyzicoRefund.getErrorMessage());
                }
            }
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus("REFUNDED");
        userService.subtractSpentAmount(order.getUserEmail(), order.getTotalPrice());

        return orderRepository.save(order);
    }

    @Transactional
    public OrderItem refundOrderItem(Long orderItemId) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ürün kalemi bulunamadı"));

        if ("REFUNDED".equals(item.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu ürün zaten iade edilmiş.");
        }

        if (item.getPaymentTransactionId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Bu ürün için iade kimliği (TransactionId) bulunmuyor.");
        }

        BigDecimal refundSum = item.getPriceAtOrder().multiply(BigDecimal.valueOf(item.getQuantity()));
        com.iyzipay.model.Refund iyzicoRefund = iyzicoPaymentService.refundProduct(item.getPaymentTransactionId(),
                refundSum);

        if (!"success".equals(iyzicoRefund.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Iyzico iade hatası: " + iyzicoRefund.getErrorMessage());
        }

        item.setStatus("REFUNDED");
        Product product = item.getProduct();
        if (product != null) {
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        userService.subtractSpentAmount(item.getOrder().getUserEmail(), refundSum);

        Order order = item.getOrder();
        boolean allRefunded = order.getItems().stream().allMatch(oi -> "REFUNDED".equals(oi.getStatus()));

        if (allRefunded) {
            order.setStatus("REFUNDED");
            orderRepository.save(order);
        }

        return orderItemRepository.save(item);
    }
}
