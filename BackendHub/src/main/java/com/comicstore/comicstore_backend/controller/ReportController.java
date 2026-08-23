package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.dto.report.OrderStatusReportResponse;
import com.comicstore.comicstore_backend.dto.report.ReportSummaryResponse;
import com.comicstore.comicstore_backend.dto.report.RevenueDailyResponse;
import com.comicstore.comicstore_backend.dto.report.TopComicResponse;
import com.comicstore.comicstore_backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    // ✅ helper: default range
    private LocalDate defaultFrom(LocalDate from, LocalDate to) {
        if (from != null) return from;
        if (to != null) return to;           // nếu chỉ truyền to -> from = to
        return LocalDate.now().minusDays(30); // default 30 ngày gần nhất
    }

    private LocalDate defaultTo(LocalDate from, LocalDate to) {
        if (to != null) return to;
        if (from != null) return from;       // nếu chỉ truyền from -> to = from
        return LocalDate.now();
    }

    // =================== 1) SUMMARY ===================
    // GET /api/admin/reports/summary?from=2025-12-01&to=2025-12-14
    @GetMapping("/summary")
    public ReportSummaryResponse summary(
            @RequestParam(value = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        LocalDate f = defaultFrom(from, to);
        LocalDate t = defaultTo(from, to);
        return reportService.summary(f, t);
    }

    // =================== 2) REVENUE DAILY ===================
    // GET /api/admin/reports/revenue-daily?from=2025-12-01&to=2025-12-14
    @GetMapping("/revenue-daily")
    public List<RevenueDailyResponse> revenueDaily(
            @RequestParam(value = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        LocalDate f = defaultFrom(from, to);
        LocalDate t = defaultTo(from, to);
        return reportService.revenueDaily(f, t);
    }

    // =================== 3) TOP COMICS ===================
    // GET /api/admin/reports/top-comics?from=2025-12-01&to=2025-12-14&limit=10
    @GetMapping("/top-comics")
    public List<TopComicResponse> topComics(
            @RequestParam(value = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(value = "limit", required = false, defaultValue = "10") int limit
    ) {
        LocalDate f = defaultFrom(from, to);
        LocalDate t = defaultTo(from, to);
        return reportService.topComics(f, t, limit);
    }
    @GetMapping("/order-status")
    public OrderStatusReportResponse orderStatusSummary(
            @RequestParam(value = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        LocalDate f = defaultFrom(from, to);
        LocalDate t = defaultTo(from, to);
        return reportService.orderStatusSummary(f, t);
}
}
