// com.comicstore.comicstore_backend.dto.order.OrderRequest.java
package com.comicstore.comicstore_backend.dto.order;

import com.comicstore.comicstore_backend.model.order.PaymentMethod;
import com.comicstore.comicstore_backend.model.order.ShippingMethod;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequest {

    private String receiverName;
    private String phone;
    private String address;
    private String note;

    private PaymentMethod paymentMethod;   // COD / VNPAY / MOMO
    private ShippingMethod shippingMethod; // SUPER_FAST / FAST

    // mã giảm giá “chung” (áp dụng cho tiền hàng)
    private String couponCode;

    // mã giảm riêng cho phí ship (nếu muốn tách)
    private String shippingCouponCode;
}
