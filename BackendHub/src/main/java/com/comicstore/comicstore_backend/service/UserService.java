package com.comicstore.comicstore_backend.service;

import com.comicstore.comicstore_backend.model.user.User;

public interface UserService {
    User findByUsername(String username);
}
