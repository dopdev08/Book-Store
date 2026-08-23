package com.comicstore.comicstore_backend.model.discount;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "discount_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType type;      // PERCENT / FIXED_AMOUNT

    @Column(nullable = false)
    private BigDecimal value;       // % hoặc số tiền

    private BigDecimal maxDiscount;     // giới hạn giảm tối đa
    private BigDecimal minOrderAmount;  // đơn tối thiểu

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    // 🟦 mới: áp dụng cho đâu (đơn / ship / cả 2)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DiscountScope scope = DiscountScope.ORDER_TOTAL;

    // 🟦 mới: giới hạn số lượt dùng toàn hệ thống (có thể null = vô hạn)
    private Integer usageLimit;   // VD: 100 lượt

    // 🟦 mới: đã dùng bao nhiêu lượt
    @Column(nullable = false)
    @Builder.Default
    private Integer usedCount = 0;

    // 🟦 mới: có công khai trên UI cho user xem hay không
    @Column(nullable = false)
    @Builder.Default
    private boolean publicVisible = true;
}
