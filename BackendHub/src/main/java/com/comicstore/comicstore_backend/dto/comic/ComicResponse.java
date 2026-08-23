package com.comicstore.comicstore_backend.dto.comic;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class ComicResponse {
    private Long id;
    private String title;
    private String author;
    private String description;
    private String thumbnailUrl;
    private BigDecimal price;
    private String categoryName;

    private boolean active;
    private Integer stock; // ✅ tồn kho
    private String previewUrl;
}
