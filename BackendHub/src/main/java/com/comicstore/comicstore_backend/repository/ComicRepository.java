package com.comicstore.comicstore_backend.repository;

import com.comicstore.comicstore_backend.model.comic.Category;
import com.comicstore.comicstore_backend.model.comic.Comic;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ComicRepository extends JpaRepository<Comic, Long> {

    // ✅ lock row để trừ kho an toàn khi tạo đơn (KHÔNG dùng @Query)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Comic> findWithLockingById(Long id);

    // ================= USER (chỉ lấy truyện đang mở bán) =================
    List<Comic> findByActiveTrue();
    List<Comic> findByCategoryAndActiveTrue(Category category);
    List<Comic> findByTitleContainingIgnoreCaseAndActiveTrue(String title);

    // ================= ADMIN =================
    List<Comic> findByCategory(Category category);
    List<Comic> findByTitleContainingIgnoreCase(String title);
    Page<Comic> findByActiveTrue(Pageable pageable);

// search theo tên (phân trang)
    Page<Comic> findByActiveTrueAndTitleContainingIgnoreCase(
            String title,
            Pageable pageable
    );

    // filter theo category name (phân trang)
    Page<Comic> findByActiveTrueAndCategory_Name(
            String categoryName,
            Pageable pageable
    );

    // search + category (phân trang)
    Page<Comic> findByActiveTrueAndCategory_NameAndTitleContainingIgnoreCase(
            String categoryName,
            String title,
            Pageable pageable
);
}
