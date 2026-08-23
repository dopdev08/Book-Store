package com.comicstore.comicstore_backend.service.impl;

import com.comicstore.comicstore_backend.exception.ResourceNotFoundException;
import com.comicstore.comicstore_backend.model.user.User;
import com.comicstore.comicstore_backend.repository.UserRepository;
import com.comicstore.comicstore_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
