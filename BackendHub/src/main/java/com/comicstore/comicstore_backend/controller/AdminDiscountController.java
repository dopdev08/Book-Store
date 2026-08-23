// com.comicstore.comicstore_backend.controller.AdminDiscountController.java
package com.comicstore.comicstore_backend.controller;

import com.comicstore.comicstore_backend.dto.discount.DiscountCodeRequest;
import com.comicstore.comicstore_backend.exception.ResourceNotFoundException;
import com.comicstore.comicstore_backend.model.discount.DiscountCode;
import com.comicstore.comicstore_backend.model.discount.DiscountScope;
import com.comicstore.comicstore_backend.repository.DiscountCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/discount-codes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDiscountController {

    private final DiscountCodeRepository discountCodeRepository;

    @GetMapping
    public List<DiscountCode> getAll() {
        return discountCodeRepository.findAll();
    }

    @PostMapping
    public DiscountCode create(@RequestBody DiscountCodeRequest req) {

        // ===== validate bắt buộc =====
        if (req.getCode() == null || req.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("code is required");
        }
        if (req.getType() == null) {
            throw new IllegalArgumentException("type is required");
        }
        if (req.getValue() == null) {
            throw new IllegalArgumentException("value is required");
        }

        // ===== normalize =====
        String normalizedCode = req.getCode().trim().toUpperCase();

        // ===== default =====
        boolean active = req.getActive() != null ? req.getActive() : true;
        boolean publicVisible = req.getPublicCode() != null ? req.getPublicCode() : true;
        DiscountScope scope = req.getScope() != null ? req.getScope() : DiscountScope.ORDER_TOTAL;

        // ===== validate theo type =====
        if (req.getValue().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("value must be >= 0");
        }
        if (req.getType().name().equals("PERCENT")) {
            // % nên từ 0..100 (tuỳ bạn muốn cho >100 hay không)
            if (req.getValue().compareTo(java.math.BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("percent value must be <= 100");
            }
        }

        // ===== validate usageLimit =====
        if (req.getUsageLimit() != null && req.getUsageLimit() < 0) {
            throw new IllegalArgumentException("usageLimit must be >= 0 or null");
        }

        DiscountCode code = DiscountCode.builder()
                .code(normalizedCode)
                .description(req.getDescription())
                .type(req.getType())
                .scope(scope)
                .value(req.getValue())
                .maxDiscount(req.getMaxDiscount())
                .minOrderAmount(req.getMinOrderAmount())
                .startAt(req.getStartAt())
                .endAt(req.getEndAt())
                .active(active)
                .publicVisible(publicVisible)
                .usageLimit(req.getUsageLimit()) // null = vô hạn
                .usedCount(0)                    // luôn 0 khi tạo mới
                .build();

        return discountCodeRepository.save(code);
    }

    @PutMapping("/{id}")
    public DiscountCode update(@PathVariable("id") Long id,
                            @RequestBody DiscountCodeRequest req) {

        DiscountCode code = discountCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount code not found"));

        // code: nếu bạn muốn KHÔNG cho sửa code thì bỏ dòng này
        if (req.getCode() != null && !req.getCode().trim().isEmpty()) {
            code.setCode(req.getCode().trim().toUpperCase());
        }

        if (req.getDescription() != null) code.setDescription(req.getDescription());
        if (req.getType() != null) code.setType(req.getType());
        if (req.getScope() != null) code.setScope(req.getScope());

        if (req.getValue() != null) {
            if (req.getValue().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("value must be >= 0");
            }
            if (req.getType() != null && req.getType().name().equals("PERCENT")) {
                if (req.getValue().compareTo(java.math.BigDecimal.valueOf(100)) > 0) {
                    throw new IllegalArgumentException("percent value must be <= 100");
                }
            }
            code.setValue(req.getValue());
        }

        if (req.getMaxDiscount() != null) code.setMaxDiscount(req.getMaxDiscount());
        if (req.getMinOrderAmount() != null) code.setMinOrderAmount(req.getMinOrderAmount());
        if (req.getStartAt() != null) code.setStartAt(req.getStartAt());
        if (req.getEndAt() != null) code.setEndAt(req.getEndAt());
        if (req.getActive() != null) code.setActive(req.getActive());

        // map publicCode -> publicVisible
        if (req.getPublicCode() != null) code.setPublicVisible(req.getPublicCode());

        // usageLimit: cho sửa, null = "không gửi" => giữ nguyên
        if (req.getUsageLimit() != null) {
            if (req.getUsageLimit() < 0) {
                throw new IllegalArgumentException("usageLimit must be >= 0");
            }
            code.setUsageLimit(req.getUsageLimit());
        }

        // usedCount: KHÔNG cho sửa ở đây (chỉ tăng khi user dùng mã)
        return discountCodeRepository.save(code);
    }


    // Bật/tắt nhanh
    @PutMapping("/{id}/active")
    public ResponseEntity<?> setActive(
            @PathVariable("id") Long id,
            @RequestParam("active") boolean active
    ) {
        DiscountCode code = discountCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount code not found"));

        code.setActive(active);
        discountCodeRepository.save(code);

        String msg = active ? "Đã kích hoạt lại mã giảm giá" : "Đã vô hiệu hóa mã giảm giá";
        return ResponseEntity.ok(msg);
    }

    // Xóa
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        DiscountCode code = discountCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount code not found"));
        discountCodeRepository.delete(code);
        return ResponseEntity.ok("Deleted discount code " + id);
    }
}
