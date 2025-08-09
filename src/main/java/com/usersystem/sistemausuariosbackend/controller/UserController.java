// src/main/java/com/usersystem/sistemausuariosbackend/controller/UserController.java

package com.usersystem.sistemausuariosbackend.controller;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.payload.UserResponseDto;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import com.usersystem.sistemausuariosbackend.service.LogService;
import com.usersystem.sistemausuariosbackend.service.UserService;
import com.usersystem.sistemausuariosbackend.model.Role;
import com.usersystem.sistemausuariosbackend.repository.RoleRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid; // Importar la anotación Valid
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final LogService logService;
    private final UserService userService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          LogService logService,
                          UserService userService,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.logService = logService;
        this.userService = userService;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<User>> getAllUsers(Authentication authentication) {
        // CAMBIO: Lógica para que el SUPERVISOR solo vea EMPLEADOS
        boolean isSupervisor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("SUPERVISOR"));

        if (isSupervisor) {
            List<User> employees = userRepository.findByRoleName("EMPLEADO");
            return ResponseEntity.ok(employees);
        } else {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        }
    }


    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(UserResponseDto::fromUser)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId, Authentication authentication, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String currentUsername = authentication.getName();
        Long currentUserId = userRepository.findByEmail(currentUsername).map(User::getId).orElse(null);

        Optional<User> userToDelete = userRepository.findById(userId);
        if (userToDelete.isPresent()) {
            userService.deleteUser(userId);
            String description = String.format("El usuario '%s' (ID: %d) ha sido eliminado.", userToDelete.get().getUsername(), userToDelete.get().getId());
            logService.log("USER_DELETED", currentUsername, currentUserId, userToDelete.get().getUsername(), userToDelete.get().getId(), description, "SUCCESS", ipAddress);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{userId}/toggle-status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long userId, Authentication authentication, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String currentUsername = authentication.getName();
        Long currentUserId = userRepository.findByEmail(currentUsername).map(User::getId).orElse(null);

        Optional<User> updatedUserOptional = userService.toggleUserStatus(userId);

        if (updatedUserOptional.isPresent()) {
            User updatedUser = updatedUserOptional.get();
            String description = String.format("Cambio de estado de la cuenta de '%s' (ID: %d) a %s.",
                    updatedUser.getUsername(), updatedUser.getId(), updatedUser.isEnabled() ? "Activo" : "Inactivo");
            logService.log("USER_STATUS_CHANGE", currentUsername, currentUserId,
                    updatedUser.getUsername(), updatedUser.getId(),
                    description, "SUCCESS", ipAddress);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody User user,
                                        Authentication authentication,
                                        HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String adminUsername = authentication.getName();
        Long adminUserId = userRepository.findByEmail(adminUsername).map(User::getId).orElse(null);

        // La anotación @Valid se encarga de la validación inicial del objeto 'user'

        // Validaciones de negocio adicionales
        if (userRepository.findByUsername(user.getUsername()).isPresent() || userRepository.findByEmail(user.getEmail()).isPresent()) {
            logService.log("USER_CREATION_ATTEMPT", adminUsername, adminUserId, null, null,
                    "Intento de creación de usuario fallido: Username o Email ya en uso.", "FAILURE", ipAddress);
            return new ResponseEntity<>("Username or Email is already taken!", HttpStatus.BAD_REQUEST);
        }

        Role assignedRole = roleRepository.findByName(user.getRole().getName())
                .orElseThrow(() -> {
                    logService.log("USER_CREATION_ATTEMPT", adminUsername, adminUserId, null, null,
                            "Intento de creación de usuario fallido: Rol '" + user.getRole().getName() + "' no encontrado.", "FAILURE", ipAddress);
                    return new RuntimeException("Error: Role '" + user.getRole().getName() + "' not found.");
                });

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEnabled(true);
        user.setRole(assignedRole); // Asegurar que el rol sea el que se encontró en la BD

        userService.saveUser(user); // Asumo que tienes un método 'saveUser' en tu servicio

        logService.log("USER_CREATED", adminUsername, adminUserId, user.getUsername(), user.getId(),
                "Nuevo usuario creado por administrador con rol " + assignedRole.getName(), "SUCCESS", ipAddress);

        return new ResponseEntity<>("User created successfully with role " + assignedRole.getName() + "!", HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> userOptional = userService.getUserById(id);
        return userOptional.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @Valid @RequestBody User user) {
        Optional<User> updatedUserOptional = userService.updateUserWithValidation(userId, user); // Nuevo método en el servicio
        return updatedUserOptional.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}