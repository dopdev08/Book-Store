package com.comicstore.comicstore_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "comicstore",      // tên folder trên Cloudinary
                            "resource_type", "image"
                    )
            );

            // secure_url: đường dẫn https an toàn
            return (String) uploadResult.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException("Upload ảnh thất bại", e);
        }
    }
    public String uploadPreviewPdf(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                throw new RuntimeException("Chỉ cho phép upload file PDF");
            }

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "comicstore/preview",
                            "resource_type", "auto",
                            "format", "pdf",
                            "use_filename", true,
                            "unique_filename", true
                    )
            );

            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Upload preview PDF thất bại", e);
        }
    }
}
