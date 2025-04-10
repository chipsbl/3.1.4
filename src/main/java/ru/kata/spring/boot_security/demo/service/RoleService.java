package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.model.Role;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface RoleService {
    List<Role> getAllRoles();

    Optional<Role> findById(Long id);

    Role findByName(String name);

    Role save(Role role);
}
