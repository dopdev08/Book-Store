package com.comicstore.comicstore_backend.dto.cart;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemRequest {
    private Long comicId;
    private int quantity;
}
