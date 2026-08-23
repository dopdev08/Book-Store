package com.comicstore.comicstore_backend.repository;

import com.comicstore.comicstore_backend.model.discount.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface DiscountCodeRepository
        extends JpaRepository<DiscountCode, Long>, JpaSpecificationExecutor<DiscountCode> {

    Optional<DiscountCode> findByCodeIgnoreCaseAndActiveTrue(String code);

    boolean existsByCodeIgnoreCase(String code);
}
