package com.murat.ecommerce.backend.event;
 
import com.murat.ecommerce.backend.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
 
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationListener {
 
    private final JavaMailSender mailSender;
 
    @Async
    @EventListener
    public void sendOrderConfirmationEmail(OrderCreatedEvent event) {
        Order order = event.getOrder();
        
        log.info("********** BİLDİRİM SİSTEMİ: MAİL GÖNDERİMİ BAŞLADI **********");
        log.info("Sipariş ID: {} için konfirme e-postası hazırlanıyor...", order.getId());
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@muratecommerce.com");
            message.setTo(order.getUserEmail());
            message.setSubject("Sipariş Onaylandı - #" + order.getId());
            
            String emailBody = String.format(
                "Merhaba %s %s,\n\n" +
                "Siparişiniz başarıyla alınmıştır ve ödemesi onaylanmıştır.\n\n" +
                "Sipariş Detayları:\n" +
                "--------------------------\n" +
                "Sipariş ID: %d\n" +
                "Toplam Tutar: %.2f TRY\n" +
                "Teslimat Adresi: %s\n" +
                "--------------------------\n\n" +
                "Bizi tercih ettiğiniz için teşekkür ederiz!\n" +
                "Murat E-Commerce Team",
                order.getBuyerName(), order.getBuyerSurname(),
                order.getId(), order.getTotalPrice(), order.getBuyerAddress()
            );
            
            message.setText(emailBody);
            
            mailSender.send(message);
            
            log.info("Sipariş Onay Maili başarıyla gönderildi: {}", order.getUserEmail());
            log.info("*************************************************");
            
        } catch (Exception e) {
            log.error("Mail gönderim hatası (Sipariş ID: {}): {}", order.getId(), e.getMessage());
        }
    }
}
