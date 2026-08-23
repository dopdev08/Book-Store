package com.comicstore.comicstore_backend.service;

import com.comicstore.comicstore_backend.dto.comic.ComicRequest;
import com.comicstore.comicstore_backend.dto.comic.ComicResponse;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface ComicService {

    // ADMIN CRUD
    ComicResponse createComic(ComicRequest request);
    ComicResponse updateComic(Long id, ComicRequest request);

    // USER: chỉ xem truyện đang mở bán
    ComicResponse getActiveComic(Long id);
    List<ComicResponse> getAllActiveComics();

    // ADMIN: xem tất cả (active + inactive)
    ComicResponse getComicAdmin(Long id);
    List<ComicResponse> getAllComicsAdmin();

    // ADMIN: bật/tắt mở bán
    void setComicActive(Long id, boolean active);

    // ✅ ADMIN: cập nhật tồn kho
    ComicResponse updateStock(Long id, int stock);
    
    Page<ComicResponse> getActiveComicsPage(String q, String category, Pageable pageable);

    void updatePreviewUrl(Long id, String previewUrl);
}
