package com.comicstore.comicstore_backend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopComicResponse {
    private Long comicId;
    private String title;
    private long quantitySold;
}
