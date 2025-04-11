package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repositories.RoleRepository;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;
import ru.kata.spring.boot_security.demo.security.UserDetailServiceImpl;

import javax.persistence.EntityNotFoundException;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserDetailServiceImpl userDetailService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserServiceImpl(UserDetailServiceImpl userDetailService, RoleRepository roleRepository, PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.userDetailService = userDetailService;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userDetailService.loadUserByUsername(username);
    }


    public User save(User user) {
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }


    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException(id + " not found");
        }
        userRepository.deleteById(id);
    }


    public User update(User user, Long id) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());
        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setAge(user.getAge());
        if (user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
            List<Role> roles = roleRepository.findAllById(user.getRoleIds());
            if (roles.size() != user.getRoleIds().size()) {
                throw new IllegalArgumentException("Some roles not found");
            }
            existingUser.getRoles().clear();
            existingUser.getRoles().addAll(roles);
        }

        if (user.getPassword() != null) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(existingUser);
    }

    public void setRoles(User user, Set<Long> selectedRoleIds) {
        Collection<Role> roles = selectedRoleIds.stream()
                .map(roleRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
        user.setRoles(roles);
    }


    @Transactional(readOnly = true)
    public List<User> getAll() {
        return userRepository.findAll();
    }


    @Transactional(readOnly = true)
    public User getById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException(id + " not found");
        }
        return userRepository.getById(id);
    }
}
