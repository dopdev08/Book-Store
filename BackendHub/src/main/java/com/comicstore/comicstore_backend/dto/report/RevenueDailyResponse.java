package com.comicstore.comicstore_backend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class RevenueDailyResponse {
    private LocalDate date;
    private BigDecimal revenue;
    private long orderCount;
}
