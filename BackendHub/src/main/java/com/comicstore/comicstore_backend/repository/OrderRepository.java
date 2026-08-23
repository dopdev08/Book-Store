package com.comicstore.comicstore_backend.repository;

import com.comicstore.comicstore_backend.model.order.Order;
import com.comicstore.comicstore_backend.model.order.OrderStatus;
import com.comicstore.comicstore_backend.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

// ✅ ADD (đếm theo status)
    long countByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime from, LocalDateTime to);
    @EntityGraph(attributePaths = {"items", "items.comic"})
    Optional<Order> findWithItemsById(Long id);
}

