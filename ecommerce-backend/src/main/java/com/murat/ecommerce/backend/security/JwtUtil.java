package com.murat.ecommerce.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;


/**
 * JWT (JSON Web Token) üretmek ve doğrulamak için kullanılan yardımcı sınıf.
 */

@Component
public class JwtUtil {

    private final String secret = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_KEY_AT_LEAST_32_CHARS";

    private Key signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // 24 saat geçerli bir token üretir
    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Token geçerliyse içindeki bilgileri (claims) döner
    public Claims validateAndGetClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(signingKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}

