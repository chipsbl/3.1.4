package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.security.UserDetailServiceImpl;

import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserDetailServiceImpl userDetailService;

    public UserServiceImpl(UserDetailServiceImpl userDetailService) {
        this.userDetailService = userDetailService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userDetailService.loadUserByUsername(username);
    }

    @Override
    public void setRoles(User user, Set<Long> selectedRoleIds) {
        userDetailService.setRoles(user, selectedRoleIds);
    }

    @Override
    public User save(User user) {
        return userDetailService.save(user);
    }

    @Override
    public void delete(Long id) {
        userDetailService.delete(id);
    }

    @Override
    public User update(User user, Long id) {
        return userDetailService.update(user, id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAll() {
        return userDetailService.getAll();
    }

    @Override
    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userDetailService.getById(id);
    }
}
