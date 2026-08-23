package com.comicstore.comicstore_backend.service.impl;

import com.comicstore.comicstore_backend.dto.order.OrderRequest;
import com.comicstore.comicstore_backend.exception.BadRequestException;
import com.comicstore.comicstore_backend.exception.ResourceNotFoundException;
import com.comicstore.comicstore_backend.model.cart.CartItem;
import com.comicstore.comicstore_backend.model.comic.Comic;
import com.comicstore.comicstore_backend.model.discount.DiscountCode;
import com.comicstore.comicstore_backend.model.discount.DiscountScope;
import com.comicstore.comicstore_backend.model.discount.DiscountType;
import com.comicstore.comicstore_backend.model.order.*;
import com.comicstore.comicstore_backend.model.user.User;
import com.comicstore.comicstore_backend.repository.CartItemRepository;
import com.comicstore.comicstore_backend.repository.ComicRepository;
import com.comicstore.comicstore_backend.repository.DiscountCodeRepository;
import com.comicstore.comicstore_backend.repository.OrderRepository;
import com.comicstore.comicstore_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final DiscountCodeRepository discountCodeRepository;

    // ✅ thêm để trừ kho an toàn
    private final ComicRepository comicRepository;

    // ======================= HÀM TÍNH GIẢM GIÁ CHUNG =======================

    private BigDecimal calcDiscountAmount(DiscountCode code, BigDecimal baseAmount) {
        if (baseAmount == null || baseAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if (code.getType() == DiscountType.PERCENT) {
            discount = baseAmount
                    .multiply(code.getValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP); // VND làm tròn 0
        } else {
            discount = code.getValue();
        }

        if (discount == null) discount = BigDecimal.ZERO;

        if (code.getMaxDiscount() != null && discount.compareTo(code.getMaxDiscount()) > 0) {
            discount = code.getMaxDiscount();
        }

        if (discount.compareTo(baseAmount) > 0) {
            discount = baseAmount;
        }

        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            discount = BigDecimal.ZERO;
        }

        return discount;
    }

    private DiscountCode validateDiscountCode(String codeStr, BigDecimal baseAmount) {
        String normalized = (codeStr == null) ? "" : codeStr.trim();
        if (normalized.isEmpty()) {
            throw new BadRequestException("Vui lòng nhập mã giảm giá.");
        }

        DiscountCode code = discountCodeRepository
                .findByCodeIgnoreCaseAndActiveTrue(normalized)
                .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại hoặc đã bị khóa."));

        LocalDateTime now = LocalDateTime.now();

        if (code.getStartAt() != null && now.isBefore(code.getStartAt())) {
            throw new BadRequestException("Mã giảm giá chưa đến thời gian sử dụng.");
        }

        if (code.getEndAt() != null && now.isAfter(code.getEndAt())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn.");
        }

        if (code.getMinOrderAmount() != null &&
                baseAmount != null &&
                baseAmount.compareTo(code.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu để dùng mã.");
        }

        int used = (code.getUsedCount() == null) ? 0 : code.getUsedCount();
        if (code.getUsageLimit() != null && used >= code.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng.");
        }

        return code;
    }

    private void increaseUsedCount(DiscountCode code) {
        int used = (code.getUsedCount() == null) ? 0 : code.getUsedCount();
        code.setUsedCount(used + 1);
        discountCodeRepository.save(code);
    }

    // ======================= TẠO ĐƠN HÀNG =======================

    @Override
    @Transactional
    public Order createOrderFromCart(User user, OrderRequest request) {

        // 1. Lấy giỏ hàng
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng trống.");
        }

        // 2) ✅ LOCK + TRỪ KHO + TẠO OrderItem
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : cartItems) {
            if (ci.getComic() == null || ci.getComic().getId() == null) {
                throw new BadRequestException("Giỏ hàng có sản phẩm không hợp lệ.");
            }

            int qty = ci.getQuantity();
            if (qty <= 0) {
                throw new BadRequestException("Số lượng mua không hợp lệ.");
            }

            // ✅ lock comic để tránh 2 người mua cùng lúc bị âm kho
            Comic comic = comicRepository.findWithLockingById(ci.getComic().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comic not found with id = " + ci.getComic().getId()));

            // ✅ nếu đã dừng bán
            if (!comic.isActive()) {
                throw new BadRequestException("Sản phẩm \"" + comic.getTitle() + "\" đã dừng bán.");
            }

            // ✅ check tồn kho (cần có field comic.stock)
            int stock = comic.getStock();
            if (stock <= 0) {
                comic.setActive(false); // phòng trường hợp stock=0 mà active vẫn true
                throw new BadRequestException("Sản phẩm \"" + comic.getTitle() + "\" đã hết hàng.");
            }

            if (stock < qty) {
                throw new BadRequestException("Sản phẩm \"" + comic.getTitle() + "\" chỉ còn " + stock + " cuốn.");
            }

            // ✅ trừ kho
            int remain = stock - qty;
            comic.setStock(remain);

            // ✅ hết hàng thì auto dừng bán
            if (remain <= 0) {
                comic.setStock(0);
                comic.setActive(false);
            }

            // tạo order item theo giá hiện tại
            OrderItem oi = OrderItem.builder()
                    .order(null)
                    .comic(comic)
                    .quantity(qty)
                    .price(comic.getPrice())
                    .build();

            orderItems.add(oi);
        }

        // 3. Tính tiền hàng
        BigDecimal itemsTotal = orderItems.stream()
                .map(oi -> oi.getPrice().multiply(BigDecimal.valueOf(oi.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Phí vận chuyển
        ShippingMethod shippingMethod = request.getShippingMethod() != null
                ? request.getShippingMethod()
                : ShippingMethod.FAST;

        BigDecimal shippingFee;
        switch (shippingMethod) {
            case SUPER_FAST:
                shippingFee = BigDecimal.valueOf(30000);
                break;
            case FAST:
            default:
                shippingFee = BigDecimal.valueOf(20000);
                break;
        }

        // 5. Tổng gốc (tiền hàng + ship)
        BigDecimal originalTotal = itemsTotal.add(shippingFee);

        // 6. Tạo Order + set thông tin
        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        String receiverName = (request.getReceiverName() != null && !request.getReceiverName().isBlank())
                ? request.getReceiverName()
                : user.getFullName();

        String phone = (request.getPhone() != null && !request.getPhone().isBlank())
                ? request.getPhone()
                : user.getPhone();

        String address = (request.getAddress() != null && !request.getAddress().isBlank())
                ? request.getAddress()
                : user.getAddress();

        order.setReceiverName(receiverName);
        order.setPhone(phone);
        order.setAddress(address);
        order.setNote(request.getNote());

        order.setPaymentMethod(
                request.getPaymentMethod() != null
                        ? request.getPaymentMethod()
                        : PaymentMethod.COD
        );

        order.setShippingMethod(shippingMethod);
        order.setShippingFee(shippingFee);
        order.setOriginalTotalPrice(originalTotal);

        // ================== ÁP DỤNG MÃ GIẢM GIÁ ==================

        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal shippingDiscountAmount = BigDecimal.ZERO;

        DiscountCode appliedOrderCode = null;
        DiscountCode appliedShipCode = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            String codeStr = request.getCouponCode().trim();
            DiscountCode code = validateDiscountCode(codeStr, itemsTotal);

            if (code.getScope() == DiscountScope.ORDER_TOTAL || code.getScope() == DiscountScope.BOTH) {
                discountAmount = discountAmount.add(calcDiscountAmount(code, itemsTotal));
                order.setCouponCode(code.getCode());
                appliedOrderCode = code;
            } else {
                throw new BadRequestException("Mã này không áp dụng cho tiền hàng.");
            }
        }

        if (request.getShippingCouponCode() != null && !request.getShippingCouponCode().isBlank()) {
            String codeStr = request.getShippingCouponCode().trim();
            DiscountCode code = validateDiscountCode(codeStr, shippingFee);

            if (code.getScope() == DiscountScope.SHIPPING_FEE || code.getScope() == DiscountScope.BOTH) {
                shippingDiscountAmount = shippingDiscountAmount.add(calcDiscountAmount(code, shippingFee));
                order.setShippingCouponCode(code.getCode());
                appliedShipCode = code;
            } else {
                throw new BadRequestException("Mã này không áp dụng cho phí vận chuyển.");
            }
        }

        BigDecimal totalDiscount = discountAmount.add(shippingDiscountAmount);
        if (totalDiscount.compareTo(originalTotal) > 0) {
            totalDiscount = originalTotal;
        }

        BigDecimal finalTotal = originalTotal.subtract(totalDiscount);

        order.setDiscountAmount(discountAmount);
        order.setShippingDiscountAmount(shippingDiscountAmount);
        order.setTotalPrice(finalTotal);

        // Gán order cho từng item
        orderItems.forEach(oi -> oi.setOrder(order));
        order.setItems(orderItems);

        // 7. Lưu Order
        Order saved = orderRepository.save(order);

        // ✅ 8. Tăng usedCount SAU khi order đã lưu OK
        if (appliedOrderCode != null) {
            increaseUsedCount(appliedOrderCode);
        }
        if (appliedShipCode != null) {
            if (appliedOrderCode == null || !appliedShipCode.getId().equals(appliedOrderCode.getId())) {
                increaseUsedCount(appliedShipCode);
            }
        }

        // 9. Xóa giỏ hàng
        cartItemRepository.deleteByUser(user);

        return saved;
    }

    // ======================= CÁC HÀM KHÁC =======================

    @Override
    public List<Order> getOrders(User user) {
        return orderRepository.findByUser(user);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    
        OrderStatus old = order.getStatus();
        if (old == status) return order;
    
        // ✅ hoàn kho khi chuyển sang CANCELLED (từ PENDING hoặc PAID)
        if (status == OrderStatus.CANCELLED && old != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Comic comic = comicRepository.findWithLockingById(item.getComic().getId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Comic not found with id = " + item.getComic().getId()));
    
                comic.setStock(comic.getStock() + item.getQuantity());
    
                // có hàng lại thì mở bán lại
                if (comic.getStock() > 0) comic.setActive(true);
            }
        }
    
        order.setStatus(status);
        return orderRepository.save(order);
}
}
