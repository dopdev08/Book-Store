package com.comicstore.comicstore_backend.repository;

import com.comicstore.comicstore_backend.model.comic.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);  
}
