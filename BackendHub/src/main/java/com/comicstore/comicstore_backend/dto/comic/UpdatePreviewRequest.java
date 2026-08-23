package com.comicstore.comicstore_backend.dto.comic;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class UpdatePreviewRequest {
    @NotBlank
    private String previewUrl;
}
