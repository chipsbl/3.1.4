package ru.kata.spring.boot_security.demo.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;
import ru.kata.spring.boot_security.demo.service.UserService;

import javax.validation.Valid;
import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

@Controller
public class GlobalRestController {

    private final UserService userService;
    private final UserRepository userRepository;

    public GlobalRestController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @ResponseBody
    @GetMapping("/api/rest")
    public List<User> getAllUsers() {
        return userService.getAll();
    }

    @GetMapping("/api/rest/current-user")
    @ResponseBody
    public User getCurrentUser(Authentication authentication) {
        // Получаем username текущего аутентифицированного пользователя
        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }

    @ResponseBody
    @GetMapping("/api/rest/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @PostMapping("/api/rest")
    @ResponseBody
    public ResponseEntity<?> createUser(@RequestBody @Valid User user) {
        try {
            User savedUser = userService.save(user);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedUser);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/rest/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @ResponseBody
    @PutMapping("/api/rest/{id}")
    public ResponseEntity<?> updateUser(@RequestBody @Valid User user, @PathVariable Long id, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            // Пропускаем ошибки валидации для пустого пароля
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> {
                if (!"password".equals(error.getField())) {
                    errors.put(error.getField(), error.getDefaultMessage());
                }
            });

            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(errors);
            }
        }
        User updateUser = userService.update(user, id);
        return ResponseEntity.ok(updateUser);
    }

    @GetMapping("/admin")
    public String index() {
        return "admin";
    }

    @GetMapping("/user")
    public String indexUser() {
        return "user";
    }

    @ResponseBody
    @GetMapping("/api/rest/user")
    public ResponseEntity<?> getUserByUsername(Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        return ResponseEntity.ok(user);
    }

    @ResponseBody
    @GetMapping("/api/rest/visible-users")
    public ResponseEntity<List<User>> getVisibleUsers(Authentication authentication) {
        // Получаем текущего пользователя
        User currentUser = userRepository.findByUsername(authentication.getName());

        // Проверяем, является ли пользователь админом
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));

        if (isAdmin) {
            // Для админа возвращаем всех пользователей
            return ResponseEntity.ok(userRepository.findAll());
        } else {
            // Для обычного пользователя возвращаем только его самого
            return ResponseEntity.ok(Collections.singletonList(currentUser));
        }
    }
}
