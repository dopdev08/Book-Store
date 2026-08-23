// com.comicstore.comicstore_backend.model.review.Review.java
package com.comicstore.comicstore_backend.model.review;

import com.comicstore.comicstore_backend.model.comic.Comic;
import com.comicstore.comicstore_backend.model.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // điểm đánh giá 1–5
    @Column(nullable = false)
    private int rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private LocalDateTime createdAt;

    // user đánh giá
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    // truyện được đánh giá
    @ManyToOne(optional = false)
    @JoinColumn(name = "comic_id")
    private Comic comic;
}
