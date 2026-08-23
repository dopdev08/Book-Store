package com.comicstore.comicstore_backend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ReportSummaryResponse {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalDiscount;
    private BigDecimal totalShippingDiscount;
    private BigDecimal totalShippingFee;
    private long uniqueBuyers;
}
