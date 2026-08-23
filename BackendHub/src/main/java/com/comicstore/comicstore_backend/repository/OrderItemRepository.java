package com.comicstore.comicstore_backend.repository;

import com.comicstore.comicstore_backend.model.order.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // ✅ ADD: lấy item theo khoảng ngày của Order
    List<OrderItem> findByOrderCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}
