package com.comicstore.comicstore_backend.service.impl;

import com.comicstore.comicstore_backend.dto.report.OrderStatusReportResponse;
import com.comicstore.comicstore_backend.dto.report.ReportSummaryResponse;
import com.comicstore.comicstore_backend.dto.report.RevenueDailyResponse;
import com.comicstore.comicstore_backend.dto.report.TopComicResponse;
import com.comicstore.comicstore_backend.model.order.Order;
import com.comicstore.comicstore_backend.model.order.OrderItem;
import com.comicstore.comicstore_backend.model.order.OrderStatus;
import com.comicstore.comicstore_backend.repository.OrderRepository;
import com.comicstore.comicstore_backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Objects;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;

    // ===== helper: convert LocalDate range -> LocalDateTime range (inclusive) =====
    private LocalDateTime startOfDay(LocalDate d) {
        return d.atStartOfDay();
    }

    private LocalDateTime endOfDay(LocalDate d) {
        // inclusive end: 23:59:59.999999999
        return d.plusDays(1).atStartOfDay().minusNanos(1);
    }

    private BigDecimal safe(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private List<Order> loadOrders(LocalDate from, LocalDate to) {
        if (from == null || to == null) return List.of();
        if (to.isBefore(from)) return List.of();

        LocalDateTime fromTime = from.atStartOfDay();
        LocalDateTime toTime = to.atTime(LocalTime.MAX);

        return orderRepository.findByCreatedAtBetween(fromTime, toTime);
    }

    // =================== REPORT 1: SUMMARY ===================
    @Override
    public ReportSummaryResponse summary(LocalDate from, LocalDate to) {

        List<Order> orders = loadOrders(from, to).stream()
        .filter(o -> o.getStatus() == OrderStatus.PAID)
        .toList();

        long totalOrders = orders.size();

        BigDecimal totalRevenue = orders.stream()
                .map(o -> safe(o.getTotalPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // giảm giá gồm: discountAmount 
        BigDecimal totalDiscount = orders.stream()
            .map(o -> safe(o.getDiscountAmount()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        //Giảm ship
        BigDecimal totalShippingDiscount = orders.stream()
            .map(o -> safe(o.getShippingDiscountAmount()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        //Tổng ship
        BigDecimal totalShippingFee = orders.stream()
            .map(o -> safe(o.getShippingFee()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        //Số người mua (distinct user)
        long uniqueBuyers = orders.stream()
            .map(o -> o.getUser() != null ? o.getUser().getId() : null)
            .filter(Objects::nonNull)
            .distinct()
            .count();
        return new ReportSummaryResponse(
                totalOrders,
                totalRevenue,
                totalDiscount,
                totalShippingDiscount,
                totalShippingFee,
                uniqueBuyers
        );
    }

    // =================== REPORT 2: REVENUE DAILY ===================
    @Override
    public List<RevenueDailyResponse> revenueDaily(LocalDate from, LocalDate to) {
        List<Order> orders = loadOrders(from, to);

        Map<LocalDate, BigDecimal> revenueByDay = new HashMap<>();
        Map<LocalDate, Long> orderCountByDay = new HashMap<>();

        for (Order o : orders) {
            if (o.getStatus() != OrderStatus.PAID) continue;
            if (o.getCreatedAt() == null) continue;

            LocalDate d = o.getCreatedAt().toLocalDate();

            // doanh thu (đang dùng totalPrice như cũ)
            BigDecimal rev = safe(o.getTotalPrice());
            revenueByDay.put(d, safe(revenueByDay.get(d)).add(rev));

            //  đếm số đơn theo ngày
            orderCountByDay.put(d, orderCountByDay.getOrDefault(d, 0L) + 1L);
        }

        // tạo list đầy đủ từng ngày (kể cả ngày không có đơn -> 0)
        List<RevenueDailyResponse> result = new ArrayList<>();
        if (from == null || to == null || to.isBefore(from)) return result;

        LocalDate cur = from;
        while (!cur.isAfter(to)) {
            BigDecimal rev = safe(revenueByDay.get(cur));
            long cnt = orderCountByDay.getOrDefault(cur, 0L);
            result.add(new RevenueDailyResponse(cur, rev, cnt));
            cur = cur.plusDays(1);
        }

        return result;
    }

    // =================== REPORT 3: TOP COMICS ===================
    @Override
    public List<TopComicResponse> topComics(LocalDate from, LocalDate to, int limit) {

        List<Order> orders = loadOrders(from, to);
        int topN = limit <= 0 ? 10 : limit;

        // gộp số lượng bán theo comicId
        Map<Long, Long> qtyByComic = new HashMap<>();
        Map<Long, String> titleByComic = new HashMap<>();

        for (Order o : orders) {
            if (o.getStatus() != OrderStatus.PAID) continue;
            List<OrderItem> items = o.getItems();
            if (items == null) continue;

            for (OrderItem it : items) {
                if (it == null || it.getComic() == null || it.getComic().getId() == null) continue;

                Long comicId = it.getComic().getId();
                String title = it.getComic().getTitle();
                long qty = it.getQuantity();

                qtyByComic.put(comicId,
                        qtyByComic.getOrDefault(comicId, 0L) + qty);

                if (title != null) {
                    titleByComic.putIfAbsent(comicId, title);
                }
            }
        }

        // sort giảm dần theo qty
        return qtyByComic.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(topN)
                .map(e -> new TopComicResponse(
                        e.getKey(),
                        titleByComic.getOrDefault(e.getKey(), "Unknown"),
                        e.getValue()
                ))
                .collect(Collectors.toList());
    }

    // =================== REPORT 4: ORDER STATUS SUMMARY ===================
    @Override
    public OrderStatusReportResponse orderStatusSummary(LocalDate from, LocalDate to) {

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(23, 59, 59);

        long pending = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.PENDING, start, end);

        long paid = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.PAID, start, end);

        long cancelled = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.CANCELLED, start, end);

        return OrderStatusReportResponse.builder()
                .pending(pending)
                .paid(paid)
                .cancelled(cancelled)
                .build();
    }
}
