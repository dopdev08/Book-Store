package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.dto.comic.ComicRequest;
import com.comicstore.comicstore_backend.dto.comic.ComicResponse;
import com.comicstore.comicstore_backend.dto.comic.UpdatePreviewRequest;
import com.comicstore.comicstore_backend.service.ComicService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/comics")
public class ComicController {

    private final ComicService comicService;

    public ComicController(ComicService comicService) {
        this.comicService = comicService;
    }

    // ================= USER =================

    // ✅ user chỉ xem truyện đang mở bán
    @GetMapping
    public List<ComicResponse> getAll() {
        return comicService.getAllActiveComics();
    }

    // ✅ user chỉ xem được nếu active=true
    @GetMapping("/{id}")
    public ComicResponse getOne(@PathVariable("id") Long id) {
        return comicService.getActiveComic(id);
    }

    // ================= ADMIN =================

    // ✅ admin xem tất cả (active + inactive)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public List<ComicResponse> getAllAdmin() {
        return comicService.getAllComicsAdmin();
    }

    // ✅ tạo truyện (admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ComicResponse> create(@Valid @RequestBody ComicRequest request) {
        return ResponseEntity.ok(comicService.createComic(request));
    }

    // ✅ update truyện (admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ComicResponse> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody ComicRequest request) {
        return ResponseEntity.ok(comicService.updateComic(id, request));
    }

    // ✅ bật / tắt mở bán (admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/active")
    public ResponseEntity<?> setActive(
            @PathVariable("id") Long id,
            @RequestParam("active") boolean active
    ) {
        comicService.setComicActive(id, active);
        return ResponseEntity.ok(active ? "Mở bán thành công" : "Dừng bán thành công");
    }

    // ✅ cập nhật tồn kho (admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/stock")
    public ResponseEntity<ComicResponse> updateStock(
            @PathVariable("id") Long id,
            @RequestParam("stock") int stock
    ) {
        return ResponseEntity.ok(comicService.updateStock(id, stock));
    }
    @GetMapping("/page")
    public Page<ComicResponse> getPage(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return comicService.getActiveComicsPage(q, category, pageable);
}
    @PutMapping("/{id}/preview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePreview(@PathVariable("id") Long id,
        @RequestBody @Valid UpdatePreviewRequest req)  {
        comicService.updatePreviewUrl(id,req.getPreviewUrl());
        return ResponseEntity.ok("message");
}
}