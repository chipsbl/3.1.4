package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.core.userdetails.UserDetails;
import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;
import java.util.Set;

public interface UserService {
    User save(User user);

    void delete(Long id);

    User update(User user, Long id);

    List<User> getAll();

    User getById(Long id);

    public UserDetails loadUserByUsername(String username);

    public void setRoles(User user, Set<Long> selectedRoleIds);
}
