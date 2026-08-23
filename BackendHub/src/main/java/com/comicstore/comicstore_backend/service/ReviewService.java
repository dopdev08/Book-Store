package com.comicstore.comicstore_backend.service;

import com.comicstore.comicstore_backend.dto.review.ReviewRequest;
import com.comicstore.comicstore_backend.dto.review.ReviewResponse;
import com.comicstore.comicstore_backend.model.user.User;

import java.util.List;

public interface ReviewService {
    ReviewResponse createOrUpdateReview(User user, ReviewRequest request);
    List<ReviewResponse> getReviewsByComic(Long comicId);
    void deleteReview(User user, Long reviewId);
    List<ReviewResponse> getMyReviews(User user);
    List<ReviewResponse> getAllReviews();
}
