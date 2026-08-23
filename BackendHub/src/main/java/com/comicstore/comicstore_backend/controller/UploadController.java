package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final ImageService imageService;

    // Chỉ ADMIN mới được upload ảnh
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = imageService.uploadImage(file);
        return ResponseEntity.ok(Map.of(
                "url", url,
                "message", "Upload ảnh thành công"
        ));
    }
    @PostMapping("/preview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadPreview(@RequestParam("file") MultipartFile file) {
        String url = imageService.uploadPreviewPdf(file); // tự viết hàm này
        return ResponseEntity.ok(Map.of("url", url, "message", "Upload preview OK"));
    }
}
