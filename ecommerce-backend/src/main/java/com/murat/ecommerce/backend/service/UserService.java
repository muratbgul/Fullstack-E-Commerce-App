package com.murat.ecommerce.backend.service;

import com.murat.ecommerce.backend.dto.LoginRequestDTO;
import com.murat.ecommerce.backend.dto.RegisterRequestDTO;
import com.murat.ecommerce.backend.entity.Role;
import com.murat.ecommerce.backend.entity.User;
import com.murat.ecommerce.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.USER);
        userRepository.save(user);
    }

    public void login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean passwordMatches = passwordEncoder.matches(dto.getPassword(), user.getPassword());
        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid password");
        }
    }
}

