package com.comicstore.comicstore_backend.service.impl;

import com.comicstore.comicstore_backend.dto.comic.ComicRequest;
import com.comicstore.comicstore_backend.dto.comic.ComicResponse;
import com.comicstore.comicstore_backend.exception.ResourceNotFoundException;
import com.comicstore.comicstore_backend.model.comic.Category;
import com.comicstore.comicstore_backend.model.comic.Comic;
import com.comicstore.comicstore_backend.repository.CategoryRepository;
import com.comicstore.comicstore_backend.repository.ComicRepository;
import com.comicstore.comicstore_backend.service.ComicService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComicServiceImpl implements ComicService {

    private final ComicRepository comicRepository;
    private final CategoryRepository categoryRepository;

    // ================= USER =================

    @Override
    public List<ComicResponse> getAllActiveComics() {
        return comicRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ComicResponse getActiveComic(Long id) {
        Comic comic = comicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comic not found with id = " + id));

        if (!comic.isActive()) {
            // user không được xem truyện đã dừng bán
            throw new ResourceNotFoundException("Comic not found with id = " + id);
        }

        return toResponse(comic);
    }

    // ================= ADMIN =================

    @Override
    public List<ComicResponse> getAllComicsAdmin() {
        return comicRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ComicResponse getComicAdmin(Long id) {
        Comic comic = comicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comic not found with id = " + id));
        return toResponse(comic);
    }

    @Override
    public void setComicActive(Long id, boolean active) {
        Comic comic = comicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comic not found with id = " + id));

        // ✅ nếu hết hàng thì không cho bật active=true (tránh “mở bán nhưng stock=0”)
        if (active && (comic.getStock() == null || comic.getStock() <= 0)) {
            throw new IllegalArgumentException("Không thể mở bán khi tồn kho = 0");
        }

        comic.setActive(active);
        comicRepository.save(comic);
    }

    @Override
    public ComicResponse updateStock(Long id, int stock) {
        if (stock < 0) {
            throw new IllegalArgumentException("stock must be >= 0");
        }

        Comic comic = comicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comic not found with id = " + id));

        comic.setStock(stock);

        // ✅ auto dừng bán nếu hết hàng
        if (stock <= 0) {
            comic.setActive(false);
        }

        // ✅ nếu có hàng lại thì cho phép mở bán lại (tuỳ bạn, mình set true cho tiện)
        if (stock > 0) {
            comic.setActive(true);
        }

        Comic saved = comicRepository.save(comic);
        return toResponse(saved);
    }

    @Override
    public ComicResponse createComic(ComicRequest request) {
        Category category = categoryRepository
                .findByName(request.getCategoryName())
                .orElseGet(() -> {
                    Category c = new Category();
                    c.setName(request.getCategoryName());
                    return categoryRepository.save(c);
                });

        Comic comic = new Comic();
        comic.setTitle(request.getTitle());
        comic.setAuthor(request.getAuthor());
        comic.setDescription(request.getDescription());
        comic.setThumbnailUrl(request.getThumbnailUrl());
        comic.setPrice(request.getPrice());
        comic.setCategory(category);

        // ✅ thêm: lưu previewUrl khi tạo
        comic.setPreviewUrl(request.getPreviewUrl()); // ✅ THÊM

        // ✅ stock (nếu không gửi thì default 0)
        int stock = request.getStock() == null ? 0 : request.getStock();
        if (stock < 0) {
            throw new IllegalArgumentException("stock must be >= 0");
        }
        comic.setStock(stock);

        // ✅ auto active theo stock
        comic.setActive(stock > 0);

        Comic saved = comicRepository.save(comic);
        return toResponse(saved);
    }

    @Override
    public ComicResponse updateComic(Long id, ComicRequest request) {
        Comic comic = comicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comic not found with id = " + id));

        Category category = categoryRepository
                .findByName(request.getCategoryName())
                .orElseGet(() -> {
                    Category c = new Category();
                    c.setName(request.getCategoryName());
                    return categoryRepository.save(c);
                });

        comic.setTitle(request.getTitle());
        comic.setAuthor(request.getAuthor());
        comic.setDescription(request.getDescription());
        comic.setThumbnailUrl(request.getThumbnailUrl());
        comic.setPrice(request.getPrice());
        comic.setCategory(category);

        // ✅ thêm: lưu previewUrl khi update
        comic.setPreviewUrl(request.getPreviewUrl()); // ✅ THÊM

        // ✅ nếu admin gửi stock thì cập nhật + auto active theo stock
        if (request.getStock() != null) {
            int stock = request.getStock();
            if (stock < 0) throw new IllegalArgumentException("stock must be >= 0");
            comic.setStock(stock);
            comic.setActive(stock > 0);
        }

        Comic saved = comicRepository.save(comic);
        return toResponse(saved);
    }

    private ComicResponse toResponse(Comic comic) {
        return ComicResponse.builder()
                .id(comic.getId())
                .title(comic.getTitle())
                .author(comic.getAuthor())
                .description(comic.getDescription())
                .thumbnailUrl(comic.getThumbnailUrl())
                .price(comic.getPrice())
                .categoryName(comic.getCategory() != null ? comic.getCategory().getName() : null)
                .active(comic.isActive())
                .stock(comic.getStock() == null ? 0 : comic.getStock())
                .previewUrl(comic.getPreviewUrl())
                .build();
    }

    @Override
    public Page<ComicResponse> getActiveComicsPage(String q, String category, Pageable pageable) {
        String keyword = (q == null) ? "" : q.trim();
        String cate = (category == null) ? "" : category.trim();

        boolean hasQ = !keyword.isBlank();
        boolean hasCate = !cate.isBlank() && !"ALL".equalsIgnoreCase(cate);

        Page<Comic> page;
        if (hasQ && hasCate) {
            page = comicRepository.findByActiveTrueAndCategory_NameAndTitleContainingIgnoreCase(cate, keyword, pageable);
        } else if (hasQ) {
            page = comicRepository.findByActiveTrueAndTitleContainingIgnoreCase(keyword, pageable);
        } else if (hasCate) {
            page = comicRepository.findByActiveTrueAndCategory_Name(cate, pageable);
        } else {
            page = comicRepository.findByActiveTrue(pageable);
        }

        return page.map(this::toResponse);
    }

    @Override
    public void updatePreviewUrl(Long comicId, String previewUrl) {
        Comic comic = comicRepository.findById(comicId)
                .orElseThrow(() -> new RuntimeException("Comic not found"));
        comic.setPreviewUrl(previewUrl);
        comicRepository.save(comic);
    } // thêm
}
