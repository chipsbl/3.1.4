package ru.kata.spring.boot_security.demo.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;
import ru.kata.spring.boot_security.demo.service.UserService;

import javax.validation.Valid;
import java.util.Collections;
import java.util.HashMap;
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

    //Все пользователи
    @ResponseBody
    @GetMapping("/api/rest")
    public List<User> getAllUsers() {
        return userService.getAll();
    }

    //Текущий аутентифицированный пользователь
    @GetMapping("/api/rest/current-user")
    @ResponseBody
    public User getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }

    //Получение пользователя по его ID
    @ResponseBody
    @GetMapping("/api/rest/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getById(id);
    }


    //Отправка пользователя
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

    //Удаление пользователя по его ID
    @DeleteMapping("/api/rest/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }


    //Обновление пользователя по его ID
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

    //Админская страница
    @GetMapping("/admin")
    public String index() {
        return "admin";
    }

    //Юзерная страница
    @GetMapping("/user")
    public String indexUser() {
        return "user";
    }

    //Получение пользователей в зависимости от роли аутентифицированного пользователя
    @ResponseBody
    @GetMapping("/api/rest/visible-users")
    public ResponseEntity<List<User>> getVisibleUsers(Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName());
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(userRepository.findAll());
        } else {
            return ResponseEntity.ok(Collections.singletonList(currentUser));
        }
    }
}
