// com.comicstore.comicstore_backend.controller.AdminUserController.java
package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.dto.user.AdminUserResponse;
import com.comicstore.comicstore_backend.exception.ResourceNotFoundException;
import com.comicstore.comicstore_backend.model.order.Order;
import com.comicstore.comicstore_backend.model.user.Role;
import com.comicstore.comicstore_backend.model.user.User;
import com.comicstore.comicstore_backend.repository.OrderRepository;
import com.comicstore.comicstore_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")   
public class AdminUserController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    private AdminUserResponse mapToDto(User u) {
        AdminUserResponse dto = new AdminUserResponse();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setFullName(u.getFullName());
        dto.setPhone(u.getPhone());
        dto.setAddress(u.getAddress());
        dto.setActive(u.isActive());
        dto.setRoles(
                u.getRoles().stream()
                        .map(Role::getName)
                        .toList()
        );
        return dto;
    }

    // 1. Danh sách tất cả user
    @GetMapping
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    // 2. Xem chi tiết 1 user (nếu cần)
    @GetMapping("/{id}")
    public AdminUserResponse getUser(@PathVariable("id") Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDto(user);
    }

    // 3. Khóa / mở khóa tài khoản
    // PUT /api/admin/users/5/active?active=false
    @PutMapping("/{id}/active")
    public ResponseEntity<?> setUserActive(
            @PathVariable("id") Long id,
            @RequestParam("active") boolean active
    ) {
        // 🔐 Không cho admin tự khóa chính mình
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest()
                    .body("Bạn không thể khóa tài khoản của chính mình.");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setActive(active);
        userRepository.save(user);

        String msg = active ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản";
        return ResponseEntity.ok(msg);
    }

    // 4. Xem các đơn hàng mà user đã mua
    // GET /api/admin/users/5/orders
    @GetMapping("/{id}/orders")
    public List<Order> getUserOrders(@PathVariable("id") Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUser(user);
    }
}
