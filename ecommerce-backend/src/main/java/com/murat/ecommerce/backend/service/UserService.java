package com.murat.ecommerce.backend.service;

import com.murat.ecommerce.backend.dto.LoginRequestDTO;
import com.murat.ecommerce.backend.dto.RegisterRequestDTO;
import com.murat.ecommerce.backend.entity.Role;
import com.murat.ecommerce.backend.entity.Segment;
import com.murat.ecommerce.backend.entity.User;
import com.murat.ecommerce.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;



@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmailAndStatus(dto.getEmail(), "ACTIVE")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu e-posta zaten kullanımda");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.USER);
        user.setSegment(Segment.BRONZE);
        userRepository.save(user);
    }

    public void login(LoginRequestDTO dto) {
        User user = userRepository.findByEmailAndStatus(dto.getEmail(), "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        boolean passwordMatches = passwordEncoder.matches(dto.getPassword(), user.getPassword());
        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hatalı şifre");
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAllByStatus("ACTIVE");
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmailAndStatus(email, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));
    }

    public User updateUserByEmail(String email, User updatedData) {
        User existingUser = userRepository.findByEmailAndStatus(email, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));
        
        existingUser.setName(updatedData.getName());
        existingUser.setPhone(updatedData.getPhone());
        existingUser.setAddress(updatedData.getAddress());
        
        return userRepository.save(existingUser);
    }

    public void addSpentAmount(String email, BigDecimal amount) {
        User user = userRepository.findByEmailAndStatus(email, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));
        
        BigDecimal currentSpent = user.getTotalSpent() != null ? user.getTotalSpent() : BigDecimal.ZERO;
        user.setTotalSpent(currentSpent.add(amount));
        updateSegment(user);
        userRepository.save(user);
    }

    public void subtractSpentAmount(String email, BigDecimal amount) {
        User user = userRepository.findByEmailAndStatus(email, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));
        
        BigDecimal currentSpent = user.getTotalSpent() != null ? user.getTotalSpent() : BigDecimal.ZERO;
        user.setTotalSpent(currentSpent.subtract(amount).max(BigDecimal.ZERO));
        updateSegment(user);
        userRepository.save(user);
    }

    private void updateSegment(User user) {
        BigDecimal spent = user.getTotalSpent() != null ? user.getTotalSpent() : BigDecimal.ZERO;
        if (spent.compareTo(new BigDecimal("10000")) >= 0) {
            user.setSegment(Segment.PLATINUM);
        } else if (spent.compareTo(new BigDecimal("5000")) >= 0) {
            user.setSegment(Segment.GOLD);
        } else if (spent.compareTo(new BigDecimal("1000")) >= 0) {
            user.setSegment(Segment.SILVER);
        } else {
            user.setSegment(Segment.BRONZE);
        }
    }

    public User updateUserRole(String email, Role newRole) {
        User user = userRepository.findByEmailAndStatus(email, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public void deleteUser(String email) {
        User user = userRepository.findByEmailAndStatus(email, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));
        user.setStatus("DELETED");
        userRepository.save(user);
    }
}
