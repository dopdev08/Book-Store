package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.dto.auth.JwtResponse;
import com.comicstore.comicstore_backend.dto.auth.LoginRequest;
import com.comicstore.comicstore_backend.dto.auth.RegisterRequest;
import com.comicstore.comicstore_backend.exception.BadRequestException;
import com.comicstore.comicstore_backend.model.user.ERole;
import com.comicstore.comicstore_backend.model.user.Role;
import com.comicstore.comicstore_backend.model.user.User;
import com.comicstore.comicstore_backend.repository.RoleRepository;
import com.comicstore.comicstore_backend.repository.UserRepository;
import com.comicstore.comicstore_backend.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .build();

        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(ERole.ROLE_USER).build()
                ));

        user.setRoles(Set.of(userRole));

        userRepository.save(user);

        return ResponseEntity.ok("Registered successfully");
    }
        
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
                // 🔹 Tìm user theo EMAIL
                User user = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new BadCredentialsException("Email or password incorrect"));
                // 🔹 KIỂM TRA TÀI KHOẢN CÓ BỊ KHÓA KHÔNG
                if (!user.isActive()) {
                // có thể dùng LockedException để bắt phía dưới
                throw new LockedException("Tài khoản của bạn đã bị khóa, vui lòng liên hệ admin.");
                }

                // 🔹 Authenticate bằng USERNAME nội bộ của user
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                user.getUsername(),         // 👈 Spring Security vẫn dùng username
                                request.getPassword()
                        )
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // 🔹 Tạo JWT (subject là username hoặc email đều được, mình giữ username cho đồng bộ)
                String jwt = jwtUtil.generateToken(user.getUsername());

                org.springframework.security.core.userdetails.User principal =
                        (org.springframework.security.core.userdetails.User) authentication.getPrincipal();

                List<String> roles = principal.getAuthorities().stream()
                        .map(a -> a.getAuthority())
                        .collect(Collectors.toList());

                JwtResponse response = new JwtResponse(
                        jwt,
                        "Bearer",
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        roles
                );

                return ResponseEntity.ok(response);

                } catch (BadCredentialsException ex) {
                // Sai email hoặc mật khẩu
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Email hoặc mật khẩu không đúng."));
                } catch (DisabledException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Tài khoản của bạn đang bị vô hiệu hóa."));
                } catch (LockedException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", ex.getMessage()));
                }
        }
}