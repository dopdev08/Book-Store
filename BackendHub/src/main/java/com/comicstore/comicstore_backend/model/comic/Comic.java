package com.comicstore.comicstore_backend.model.comic;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "comics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;       // tên truyện

    private String author;      // tác giả

    private String description;

    private String thumbnailUrl; // link ảnh bìa

    @Column(nullable = false)
    private BigDecimal price;   // giá

    private LocalDate releaseDate;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // ✅ tồn kho
    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    // ✅ mở bán / dừng bán
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = true)
    private String previewUrl ;
}
