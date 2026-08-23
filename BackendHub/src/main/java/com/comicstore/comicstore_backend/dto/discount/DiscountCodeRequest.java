package com.comicstore.comicstore_backend.dto.discount;

import com.comicstore.comicstore_backend.model.discount.DiscountScope;
import com.comicstore.comicstore_backend.model.discount.DiscountType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class DiscountCodeRequest {

    private String code;
    private String description;

    private DiscountType type;      // PERCENT / FIXED_AMOUNT
    private DiscountScope scope;    

    private BigDecimal value;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    private Boolean active;        // optional, default true
    private Boolean publicCode; 
    private Integer usageLimit;   // optional, default true
}
