package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.dto.user.UserUpdateRequest;
import com.comicstore.comicstore_backend.model.user.User;
import com.comicstore.comicstore_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.comicstore.comicstore_backend.dto.user.ChangePasswordRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // 🟢 Lấy thông tin user hiện tại (dùng để autofill form checkout / profile)
    @GetMapping("/me")
    public ResponseEntity<User> getMe() {
        return ResponseEntity.ok(getCurrentUser());
    }

    // 🟢 Cập nhật thông tin user (fullName / phone / address)
    @PutMapping("/me")
    public ResponseEntity<User> updateMe(@RequestBody UserUpdateRequest req) {
        User user = getCurrentUser();

        if (req.getFullName() != null) {
            user.setFullName(req.getFullName());
        }
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone());
        }
        if (req.getAddress() != null) {
            user.setAddress(req.getAddress());
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        User user = getCurrentUser();

        // 1) confirm mật khẩu mới
        if (!req.getNewPassword().equals(req.getConfirmNewPassword())) {
            return ResponseEntity.badRequest().body("Mật khẩu mới không khớp");
        }

        // 2) check mật khẩu cũ
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Mật khẩu cũ không đúng");
        }

        // 3) cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }
}

