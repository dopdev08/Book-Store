package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.exception.BadRequestException;
import com.comicstore.comicstore_backend.model.discount.DiscountCode;
import com.comicstore.comicstore_backend.repository.DiscountCodeRepository;
import com.comicstore.comicstore_backend.repository.spec.DiscountCodeSpecs;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/discount-codes")
@RequiredArgsConstructor
public class DiscountPublicController {

    private final DiscountCodeRepository discountCodeRepository;

    @GetMapping("/public")
    public List<DiscountCode> getPublicCodes() {
        LocalDateTime now = LocalDateTime.now();
        return discountCodeRepository.findAll(
                DiscountCodeSpecs.isPublicActive()
                        .and(DiscountCodeSpecs.startValid(now))
                        .and(DiscountCodeSpecs.endValid(now))
                        .and(DiscountCodeSpecs.notOverUsageLimit())
        );
    }

    @GetMapping("/check")
    public DiscountCode checkCode(@RequestParam("code") String code) {
        String normalized = (code == null) ? "" : code.trim();
        if (normalized.isEmpty()) throw new BadRequestException("Vui lòng nhập mã giảm giá.");

        DiscountCode dc = discountCodeRepository
                .findByCodeIgnoreCaseAndActiveTrue(normalized)
                .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa."));

        LocalDateTime now = LocalDateTime.now();

        if (dc.getStartAt() != null && dc.getStartAt().isAfter(now)) {
            throw new BadRequestException("Mã giảm giá chưa đến thời gian áp dụng.");
        }
        if (dc.getEndAt() != null && dc.getEndAt().isBefore(now)) {
            throw new BadRequestException("Mã giảm giá đã hết hạn.");
        }

        int used = (dc.getUsedCount() == null) ? 0 : dc.getUsedCount();
        if (dc.getUsageLimit() != null && used >= dc.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng.");
        }

        return dc;
    }
}
