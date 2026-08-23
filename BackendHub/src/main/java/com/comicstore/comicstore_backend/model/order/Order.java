package com.comicstore.comicstore_backend.model.order;

import com.comicstore.comicstore_backend.model.user.User;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;

    // 🟦 Tổng tiền gốc trước khi áp dụng mã giảm giá
    private BigDecimal originalTotalPrice;

    // 🟦 Số tiền được giảm
    private BigDecimal discountAmount;

    // 🟦 Mã giảm giá đã sử dụng (nếu có)
    private String couponCode;

    // 🟦 Tổng tiền sau khi giảm
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String receiverName;
    private String phone;
    private String address;
    private String note;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<OrderItem> items;
    // com.comicstore.comicstore_backend.model.order.Order.java

    @Enumerated(EnumType.STRING)
    private ShippingMethod shippingMethod;  // SUPER_FAST / FAST

    private BigDecimal shippingFee;          // 30000 hoặc 20000

    // nếu có mã giảm ship riêng
    private BigDecimal shippingDiscountAmount;  
    private String shippingCouponCode;

}
