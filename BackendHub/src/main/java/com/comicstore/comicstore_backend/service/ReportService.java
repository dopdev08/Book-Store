package com.comicstore.comicstore_backend.service;

import com.comicstore.comicstore_backend.dto.report.*;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    ReportSummaryResponse summary(LocalDate from, LocalDate to);

    List<RevenueDailyResponse> revenueDaily(LocalDate from, LocalDate to);

    List<TopComicResponse> topComics(LocalDate from, LocalDate to, int limit);

    OrderStatusReportResponse orderStatusSummary(LocalDate from, LocalDate to);
}
