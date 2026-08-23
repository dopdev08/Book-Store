package com.comicstore.comicstore_backend.dto.review;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewResponse {
    private Long id;
    private Long comicId;
    private String comicTitle;

    private Long userId;
    private String username;

    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
