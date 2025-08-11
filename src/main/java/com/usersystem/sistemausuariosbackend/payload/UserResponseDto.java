// src/main/java/com/usersystem/sistemausuariosbackend/payload/UserResponseDto.java
package com.usersystem.sistemausuariosbackend.payload;

import com.usersystem.sistemausuariosbackend.model.Role;
import com.usersystem.sistemausuariosbackend.model.User; // <-- ¡Importar el modelo User!
import lombok.Data;
import java.time.LocalDate;

@Data
public class UserResponseDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String dni;
    private String dateOfBirth;
    private String phoneNumber;
    private String role;
    private boolean enabled;
    private String avatarUrl; // ⬅️ CAMBIADO: Coincide con tu modelo User
    private boolean twoFactorEnabled;

    public UserResponseDto(Long id, String firstName, String lastName, String email, String dni, String dateOfBirth, String phoneNumber, String role, boolean enabled, String avatarFileName, boolean twoFactorEnabled) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dni = dni;
        this.dateOfBirth = dateOfBirth;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.enabled = enabled;
        this.avatarUrl = avatarUrl; // ⬅️ Asignación directa y correcta
        this.twoFactorEnabled = twoFactorEnabled; // <-- ¡Inicializa el campo!
    }

    /**
     * Método estático de fábrica para crear un DTO a partir de un objeto User.
     * Esto resuelve el error de 'Cannot resolve method fromUser'.
     *
     * @param user El objeto User desde el que se crearán los datos del DTO.
     * @return Una nueva instancia de UserResponseDto.
     */
    public static UserResponseDto fromUser(User user) {
        String roleName = user.getRole() != null ? user.getRole().getName() : null;
        return new UserResponseDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getDni(),
                user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null,
                user.getPhoneNumber(),
                roleName,
                user.isEnabled(),
                user.getAvatarUrl(), // ⬅️ CAMBIADO: Llama al metodo correcto
                user.isTwoFactorEnabled() // <-- ¡Obtén el valor del usuario!
        );
    }
}
