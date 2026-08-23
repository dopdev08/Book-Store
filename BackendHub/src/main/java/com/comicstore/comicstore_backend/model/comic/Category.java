package com.comicstore.comicstore_backend.model.comic;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;    // ví dụ: Shonen, Romance, Action

    @JsonIgnore  // 👈 tránh vòng lặp Category -> comics -> category -> ...
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<Comic> comics;
}
