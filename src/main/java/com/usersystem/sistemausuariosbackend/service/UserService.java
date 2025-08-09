package com.usersystem.sistemausuariosbackend.service;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import com.usersystem.sistemausuariosbackend.repository.RoleRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * Guarda un nuevo usuario en la base de datos.
     * @param user El objeto User a guardar.
     * @return El usuario guardado.
     */
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Obtiene una lista de todos los usuarios del sistema.
     * @return Una lista de todos los usuarios.
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Busca un usuario por su ID.
     * @param id El ID del usuario.
     * @return Un Optional que contiene el usuario si se encuentra, o un Optional vacío.
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Elimina un usuario por su ID.
     * @param id El ID del usuario a eliminar.
     * @return Verdadero si se elimina, falso si no existe.
     */
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Activa o desactiva la cuenta de un usuario.
     * @param id El ID del usuario.
     * @return Un Optional que contiene el usuario actualizado, o un Optional vacío si no se encuentra.
     */
    public Optional<User> toggleUserStatus(Long id) {
        return userRepository.findById(id).map(user -> {
            user.setEnabled(!user.isEnabled());
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        });
    }

    /**
     * Actualiza los datos de un usuario existente utilizando un objeto User validado.
     * Este método recibe un objeto User y actualiza solo los campos que no son nulos en él,
     * para no sobrescribir datos accidentalmente.
     *
     * @param userId El ID del usuario a actualizar.
     * @param updatedUser El objeto User con los nuevos datos.
     * @return Un Optional que contiene el usuario actualizado, o un Optional vacío si no se encuentra.
     */
    public Optional<User> updateUserWithValidation(Long userId, User updatedUser) {
        return userRepository.findById(userId).map(existingUser -> {
            // Actualizamos solo los campos que vienen con datos
            if (updatedUser.getFirstName() != null) {
                existingUser.setFirstName(updatedUser.getFirstName());
            }
            if (updatedUser.getLastName() != null) {
                existingUser.setLastName(updatedUser.getLastName());
            }
            if (updatedUser.getUsername() != null) {
                existingUser.setUsername(updatedUser.getUsername());
            }
            if (updatedUser.getEmail() != null) {
                existingUser.setEmail(updatedUser.getEmail());
            }
            if (updatedUser.getDni() != null) {
                existingUser.setDni(updatedUser.getDni());
            }
            if (updatedUser.getDateOfBirth() != null) {
                existingUser.setDateOfBirth(updatedUser.getDateOfBirth());
            }
            if (updatedUser.getPhoneNumber() != null) {
                existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
            }
            if (updatedUser.getRole() != null) {
                existingUser.setRole(updatedUser.getRole());
            }

            existingUser.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(existingUser);
        });
    }

    // El método antiguo ya no se usa, lo podemos eliminar.
    // public Optional<User> updateUser(Long userId, Map<String, String> updateRequest) { ... }
}