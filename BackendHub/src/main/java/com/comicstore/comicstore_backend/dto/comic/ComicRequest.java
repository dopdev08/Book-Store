package com.comicstore.comicstore_backend.dto.comic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ComicRequest {

    @NotBlank
    private String title;

    private String author;

    private String description;

    private String thumbnailUrl;

    @NotNull
    private BigDecimal price;

    @NotBlank
    private String categoryName;

    private Integer stock;

    private String previewUrl; // ✅ THÊM DÒNG NÀY
}
