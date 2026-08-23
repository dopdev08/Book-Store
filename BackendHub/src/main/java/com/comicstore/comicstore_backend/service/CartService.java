package com.comicstore.comicstore_backend.service;

import com.comicstore.comicstore_backend.dto.cart.CartItemRequest;
import com.comicstore.comicstore_backend.model.cart.CartItem;
import com.comicstore.comicstore_backend.model.user.User;

import java.util.List;

public interface CartService {
    List<CartItem> getCartItems(User user);
    CartItem addToCart(User user, CartItemRequest request);
    CartItem updateCartItem(User user, Long cartItemId, int quantity);
    void removeCartItem(User user, Long cartItemId);
    void clearCart(User user);
}
