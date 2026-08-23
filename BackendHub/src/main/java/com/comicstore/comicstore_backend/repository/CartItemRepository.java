package com.comicstore.comicstore_backend.repository;

import com.comicstore.comicstore_backend.model.cart.CartItem;
import com.comicstore.comicstore_backend.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUser(User user);

    Optional<CartItem> findByUserAndComicId(User user, Long comicId);

    @Modifying
    @Transactional
    void deleteByUser(User user);
}
