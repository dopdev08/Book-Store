package com.comicstore.comicstore_backend.repository;

import com.comicstore.comicstore_backend.model.review.Review;
import com.comicstore.comicstore_backend.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByComicId(Long comicId);

    // để mỗi user chỉ có 1 review / 1 truyện 
    Optional<Review> findByComicIdAndUser(Long comicId, User user);
    List<Review> findByUser(User user);
}
