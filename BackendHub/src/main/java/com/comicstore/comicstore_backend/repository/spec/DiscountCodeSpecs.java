package com.comicstore.comicstore_backend.repository.spec;

import com.comicstore.comicstore_backend.model.discount.DiscountCode;
import com.comicstore.comicstore_backend.model.discount.DiscountScope;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;

public class DiscountCodeSpecs {

    public static Specification<DiscountCode> isPublicActive() {
        return (root, q, cb) -> cb.and(
                cb.isTrue(root.get("active")),
                cb.isTrue(root.get("publicVisible"))
        );
    }

    public static Specification<DiscountCode> scopeIn(List<DiscountScope> scopes) {
        return (root, q, cb) -> root.get("scope").in(scopes);
    }

    public static Specification<DiscountCode> startValid(LocalDateTime now) {
        return (root, q, cb) -> cb.or(
                cb.isNull(root.get("startAt")),
                cb.lessThanOrEqualTo(root.get("startAt"), now)
        );
    }

    public static Specification<DiscountCode> endValid(LocalDateTime now) {
        return (root, q, cb) -> cb.or(
                cb.isNull(root.get("endAt")),
                cb.greaterThanOrEqualTo(root.get("endAt"), now)
        );
    }

    public static Specification<DiscountCode> notOverUsageLimit() {
        return (root, q, cb) -> cb.or(
                cb.isNull(root.get("usageLimit")),
                cb.lessThan(root.get("usedCount"), root.get("usageLimit"))
        );
    }
}
