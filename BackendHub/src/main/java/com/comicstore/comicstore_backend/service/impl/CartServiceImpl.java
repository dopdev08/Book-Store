package com.comicstore.comicstore_backend.service.impl;

import com.comicstore.comicstore_backend.dto.cart.CartItemRequest;
import com.comicstore.comicstore_backend.exception.BadRequestException;
import com.comicstore.comicstore_backend.exception.ResourceNotFoundException;
import com.comicstore.comicstore_backend.model.cart.CartItem;
import com.comicstore.comicstore_backend.model.comic.Comic;
import com.comicstore.comicstore_backend.model.user.User;
import com.comicstore.comicstore_backend.repository.CartItemRepository;
import com.comicstore.comicstore_backend.repository.ComicRepository;
import com.comicstore.comicstore_backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;   // 🆕 import

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ComicRepository comicRepository;

    @Override
    public List<CartItem> getCartItems(User user) {
        return cartItemRepository.findByUser(user);
    }

    @Override
    @Transactional
    public CartItem addToCart(User user, CartItemRequest request) {
        Comic comic = comicRepository.findById(request.getComicId())
                .orElseThrow(() -> new ResourceNotFoundException("Comic not found"));

        CartItem cartItem = cartItemRepository.findByUserAndComicId(user, comic.getId())
                .orElseGet(() -> CartItem.builder()
                        .user(user)
                        .comic(comic)
                        .quantity(0)
                        .build());

        cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());

        if (cartItem.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be > 0");
        }

        return cartItemRepository.save(cartItem);
    }

    @Override
    @Transactional
    public CartItem updateCartItem(User user, Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Not your cart item");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    @Override
    @Transactional
    public void removeCartItem(User user, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Not your cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    @Override
    @Transactional
    public void clearCart(User user) {
        // Cách 1: dùng deleteByUser (đã @Modifying + @Transactional trong repo)
        cartItemRepository.deleteByUser(user);

        // Hoặc cách 2 (an toàn, dễ debug hơn):
        // List<CartItem> items = cartItemRepository.findByUser(user);
        // cartItemRepository.deleteAll(items);
    }
}
