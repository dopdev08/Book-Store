package com.comicstore.comicstore_backend.dto.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    private String fullName;
    private String phone;
    private String address;
}
