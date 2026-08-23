package com.comicstore.comicstore_backend.dto.discount;

import com.comicstore.comicstore_backend.model.discount.DiscountScope;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class DiscountPreviewResponse {
    private String code;
    private DiscountScope scope;
    private BigDecimal baseAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
}
