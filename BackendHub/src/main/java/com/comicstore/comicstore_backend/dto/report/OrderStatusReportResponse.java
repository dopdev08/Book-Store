package com.comicstore.comicstore_backend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class OrderStatusReportResponse {
    private long pending;
    private long paid;
    private long cancelled;
}
