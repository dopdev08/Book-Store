package com.comicstore.comicstore_backend.dto.review;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequest {
    private Long comicId;
    private int rating;      // 1-5
    private String comment;
}
