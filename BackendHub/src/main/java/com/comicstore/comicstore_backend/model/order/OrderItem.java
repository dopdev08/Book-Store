package com.comicstore.comicstore_backend.model.order;

import com.comicstore.comicstore_backend.model.comic.Comic;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;

    @ManyToOne(optional = false)
    @JoinColumn(name = "comic_id")
    private Comic comic;

    private int quantity;

    private BigDecimal price; // giá tại thời điểm mua
}
