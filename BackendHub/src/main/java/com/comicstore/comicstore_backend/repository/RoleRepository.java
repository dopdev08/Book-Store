package com.comicstore.comicstore_backend.repository;

import com.comicstore.comicstore_backend.model.user.ERole;
import com.comicstore.comicstore_backend.model.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}
