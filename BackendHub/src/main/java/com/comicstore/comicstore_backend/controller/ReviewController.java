// com.comicstore.comicstore_backend.controller.ReviewController.java
package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.dto.review.ReviewRequest;
import com.comicstore.comicstore_backend.dto.review.ReviewResponse;
import com.comicstore.comicstore_backend.model.user.User;
import com.comicstore.comicstore_backend.repository.UserRepository;
import com.comicstore.comicstore_backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // user tạo / sửa review
    @PostMapping
    public ResponseEntity<ReviewResponse> createOrUpdate(@RequestBody ReviewRequest request) {
        ReviewResponse res = reviewService.createOrUpdateReview(getCurrentUser(), request);
        return ResponseEntity.ok(res);
    }

    // lấy danh sách review theo truyện (public)
    @GetMapping("/comic/{comicId}")
    public List<ReviewResponse> getReviewsByComic(@PathVariable("comicId") Long comicId) {
        return reviewService.getReviewsByComic(comicId);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable("id") Long reviewId) {
        reviewService.deleteReview(getCurrentUser(), reviewId);
        return ResponseEntity.ok("Deleted review " + reviewId);
    }
    @GetMapping("/my")
    public List<ReviewResponse> getMyReviews() {
        return reviewService.getMyReviews(getCurrentUser());
    }
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReviewResponse> getAllReviewsForAdmin() {
        return reviewService.getAllReviews();
    }
}
