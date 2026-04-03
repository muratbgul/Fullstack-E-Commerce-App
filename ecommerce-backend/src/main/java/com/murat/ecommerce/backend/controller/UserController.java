package com.murat.ecommerce.backend.controller;

import com.murat.ecommerce.backend.entity.User;
import com.murat.ecommerce.backend.service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;



@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email);
    }

    @GetMapping("/me")
    public User getCurrentUser() {
        String email = (String) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.getUserByEmail(email);
    }

    @PutMapping("/me")
    public User updateCurrentUser(@RequestBody User updatedData) {
        String email = (String) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.updateUserByEmail(email, updatedData);
    }

    @PutMapping("/{email}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public User updateUserRole(@PathVariable String email, @RequestBody Map<String, String> body) {
        String roleStr = body.get("role");
        com.murat.ecommerce.backend.entity.Role role = com.murat.ecommerce.backend.entity.Role.valueOf(roleStr);
        return userService.updateUserRole(email, role);
    }

    @DeleteMapping("/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable String email) {
        userService.deleteUser(email);
    }
}
