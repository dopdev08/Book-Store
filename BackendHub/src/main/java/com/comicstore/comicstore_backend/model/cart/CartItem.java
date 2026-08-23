package com.comicstore.comicstore_backend.model.cart;

import com.comicstore.comicstore_backend.model.comic.Comic;
import com.comicstore.comicstore_backend.model.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore                      // Không serialize user để tránh vòng lặp
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "comic_id")
    private Comic comic;

    @Column(nullable = false)
    private int quantity;
}
