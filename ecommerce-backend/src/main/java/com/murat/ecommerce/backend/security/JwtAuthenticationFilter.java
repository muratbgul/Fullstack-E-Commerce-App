package com.murat.ecommerce.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


/**
 * Her gelen HTTP isteğini kontrol eden ve JWT token'ı varsa kullanıcıyı doğrulayan filtre.
 */

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        // Authorization başlığını kontrol et ve "Bearer " kısmını ayır
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            io.jsonwebtoken.Claims claims = jwtUtil.validateAndGetClaims(token);
            String email = claims != null ? claims.getSubject() : null;
            String role = claims != null ? claims.get("role", String.class) : null;

            // Kullanıcı doğrulanmışsa ve sistemde henüz yetkilendirilmemişse SecurityContext'e ekle
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                org.springframework.security.core.authority.SimpleGrantedAuthority authority = 
                        new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role);
                
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(email, null, java.util.List.of(authority));
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}

