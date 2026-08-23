package com.comicstore.comicstore_backend.service;

import com.comicstore.comicstore_backend.dto.order.OrderRequest;
import com.comicstore.comicstore_backend.model.order.Order;
import com.comicstore.comicstore_backend.model.order.OrderStatus;
import com.comicstore.comicstore_backend.model.user.User;

import java.util.List;

public interface OrderService {
    Order createOrderFromCart(User user, OrderRequest request);
    List<Order> getOrders(User user);

    List<Order> getAllOrders();
    Order updateStatus(Long orderId, OrderStatus status);
}
