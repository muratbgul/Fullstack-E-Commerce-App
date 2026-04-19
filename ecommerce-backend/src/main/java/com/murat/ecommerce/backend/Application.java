package com.murat.ecommerce.backend;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Uygulamanın ana başlangıç noktası.
 */
@EnableAsync // Asenkron işlemleri aktif eder.
@EnableCaching // Verilerin hızlı getirilmesi için önbelleğe almayı aktif eder.
@SpringBootApplication // Bu bir Spring Boot uygulamasıdır.
public class Application {

	/**
	 * Uygulamayı başlatan ana metod.
	 */
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}
