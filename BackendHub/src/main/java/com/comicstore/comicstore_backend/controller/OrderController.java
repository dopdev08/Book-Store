package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.dto.order.OrderRequest;
import com.comicstore.comicstore_backend.model.order.Order;
import com.comicstore.comicstore_backend.model.user.User;
import com.comicstore.comicstore_backend.repository.UserRepository;
import com.comicstore.comicstore_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.comicstore.comicstore_backend.model.order.OrderStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(
            orderService.createOrderFromCart(getCurrentUser(), request)
        );
    }
    
    @GetMapping("/my")
    public List<Order> getMyOrders() {
        return orderService.getOrders(getCurrentUser());
    }
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAllOrdersAdmin() {
        return orderService.getAllOrders();
    }

    // 🆕 Cập nhật trạng thái đơn cho ADMIN
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateStatus(
            @PathVariable("orderId") Long orderId,
            @RequestParam("status") OrderStatus status
    ) {
        orderService.updateStatus(orderId, status);
        return ResponseEntity.noContent().build(); 
}
}
