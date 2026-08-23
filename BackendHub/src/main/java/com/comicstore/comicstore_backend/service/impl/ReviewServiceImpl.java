package com.comicstore.comicstore_backend.service.impl;

import com.comicstore.comicstore_backend.dto.review.ReviewRequest;
import com.comicstore.comicstore_backend.dto.review.ReviewResponse;
import com.comicstore.comicstore_backend.exception.BadRequestException;
import com.comicstore.comicstore_backend.exception.ResourceNotFoundException;
import com.comicstore.comicstore_backend.model.comic.Comic;
import com.comicstore.comicstore_backend.model.order.Order;
import com.comicstore.comicstore_backend.model.order.OrderItem;
import com.comicstore.comicstore_backend.model.order.OrderStatus;
import com.comicstore.comicstore_backend.model.review.Review;
import com.comicstore.comicstore_backend.model.user.User;
import com.comicstore.comicstore_backend.repository.ComicRepository;
import com.comicstore.comicstore_backend.repository.OrderRepository;
import com.comicstore.comicstore_backend.repository.ReviewRepository;
import com.comicstore.comicstore_backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.comicstore.comicstore_backend.model.user.ERole;
import com.comicstore.comicstore_backend.model.user.Role;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ComicRepository comicRepository;
    private final OrderRepository orderRepository;

    private boolean hasUserPurchasedComic(User user, Long comicId) {
        List<Order> orders = orderRepository.findByUser(user);
        return orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID) // hoặc chỉ PAID
                .map(Order::getItems)
                .flatMap(List::stream)
                .map(OrderItem::getComic)
                .anyMatch(c -> c.getId().equals(comicId));
    }

    private ReviewResponse mapToResponse(Review review) {
        ReviewResponse res = new ReviewResponse();
        res.setId(review.getId());
        res.setComicId(review.getComic().getId());
        res.setComicTitle(review.getComic().getTitle());
        res.setUserId(review.getUser().getId());
        res.setUsername(review.getUser().getUsername());
        res.setRating(review.getRating());
        res.setComment(review.getComment());
        res.setCreatedAt(review.getCreatedAt());
        return res;
    }

    @Override
    public ReviewResponse createOrUpdateReview(User user, ReviewRequest request) {
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Điểm đánh giá phải từ 1 đến 5");
        }

        Long comicId = request.getComicId();
        Comic comic = comicRepository.findById(comicId)
                .orElseThrow(() -> new ResourceNotFoundException("Comic not found"));

        // kiểm tra đã mua chưa
        if (!hasUserPurchasedComic(user, comicId)) {
            throw new BadRequestException("Bạn chỉ có thể đánh giá truyện đã mua.");
        }

        // nếu đã từng đánh giá truyện này -> cập nhật
        Review review = reviewRepository.findByComicIdAndUser(comicId, user)
                .orElseGet(() -> Review.builder()
                        .user(user)
                        .comic(comic)
                        .createdAt(LocalDateTime.now())
                        .build());

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        if (review.getCreatedAt() == null) {
            review.setCreatedAt(LocalDateTime.now());
        }

        Review saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Override
    public List<ReviewResponse> getReviewsByComic(Long comicId) {
        List<Review> reviews = reviewRepository.findByComicId(comicId);
        return reviews.stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    public void deleteReview(User user, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        boolean isOwner = review.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().stream()
                .map(Role::getName)
                .anyMatch(r -> r == ERole.ROLE_ADMIN);

        if (!isOwner && !isAdmin) {
            throw new BadRequestException("Bạn không có quyền xóa đánh giá này.");
        }

        reviewRepository.delete(review);
    }
    @Override
    public List<ReviewResponse> getMyReviews(User user) {
        List<Review> reviews = reviewRepository.findByUser(user);
        return reviews.stream()
                .map(this::mapToResponse)
                .toList();
    }
        @Override
    public List<ReviewResponse> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        return reviews.stream()
                .map(this::mapToResponse)
                .toList();
    }
}
