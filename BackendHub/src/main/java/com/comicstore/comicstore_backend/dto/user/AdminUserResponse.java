// com.comicstore.comicstore_backend.dto.user.AdminUserResponse.java
package com.comicstore.comicstore_backend.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

import com.comicstore.comicstore_backend.model.user.ERole;

@Getter
@Setter
public class AdminUserResponse {

    private Long id;
    private String username;
    private String email;

    private String fullName;
    private String phone;
    private String address;

    private boolean active;

    private List<ERole> roles;
}
