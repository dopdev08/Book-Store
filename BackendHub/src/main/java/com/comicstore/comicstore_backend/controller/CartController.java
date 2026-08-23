package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.dto.cart.CartItemRequest;
import com.comicstore.comicstore_backend.model.cart.CartItem;
import com.comicstore.comicstore_backend.model.user.User;
import com.comicstore.comicstore_backend.repository.UserRepository;
import com.comicstore.comicstore_backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<CartItem> getCart() {
        return cartService.getCartItems(getCurrentUser());
    }

    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addToCart(getCurrentUser(), request));
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable("cartItemId") Long cartItemId,
            @RequestParam("quantity") int quantity
    ) {
        CartItem updated = cartService.updateCartItem(getCurrentUser(), cartItemId, quantity);

        // Nếu quantity <= 0 thì service đã xóa item và trả về null
        if (updated == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeItem(@PathVariable("cartItemId") Long cartItemId) {
        cartService.removeCartItem(getCurrentUser(), cartItemId);
        return ResponseEntity.ok("Removed");
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        cartService.clearCart(getCurrentUser());
        return ResponseEntity.ok("Cleared");
    }
}
