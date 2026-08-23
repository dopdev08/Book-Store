// com.comicstore.comicstore_backend.model.discount.DiscountScope.java
package com.comicstore.comicstore_backend.model.discount;

public enum DiscountScope {
    ORDER_TOTAL,   // chỉ áp dụng cho tiền hàng
    SHIPPING_FEE,  // chỉ áp dụng cho phí ship
    BOTH           // áp dụng cho cả hai (nếu bạn muốn)
}
