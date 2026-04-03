package com.murat.ecommerce.backend.controller;

import com.murat.ecommerce.backend.dto.LoginRequestDTO;
import com.murat.ecommerce.backend.dto.RegisterRequestDTO;
import com.murat.ecommerce.backend.security.JwtUtil;
import com.murat.ecommerce.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.util.Map;



@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequestDTO dto) {
        userService.login(dto);
        com.murat.ecommerce.backend.entity.User user = userService.getUserByEmail(dto.getEmail());
        String token = jwtUtil.generateToken(dto.getEmail(), user.getRole().name());
        return ResponseEntity.status(HttpStatus.OK).body(
                Map.of(
                        "message", "Giriş başarılı",
                        "token", token
                )
        );
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequestDTO dto) {
        userService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Kayıt başarılı"));
    }
}

