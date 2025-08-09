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
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private boolean enabled;
    private String role;

    public UserResponseDto(
            Long id,
            String firstName,
            String lastName,
            String email,
            String dni,
            LocalDate dateOfBirth,
            String phoneNumber,
            boolean enabled,
            Role role) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dni = dni;
        this.dateOfBirth = dateOfBirth;
        this.phoneNumber = phoneNumber;
        this.enabled = enabled;
        this.role = (role != null) ? role.getName() : null;
    }

    /**
     * Método estático de fábrica para crear un DTO a partir de un objeto User.
     * Esto resuelve el error de 'Cannot resolve method fromUser'.
     *
     * @param user El objeto User desde el que se crearán los datos del DTO.
     * @return Una nueva instancia de UserResponseDto.
     */
    public static UserResponseDto fromUser(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getDni(),
                user.getDateOfBirth(),
                user.getPhoneNumber(),
                user.isEnabled(),
                user.getRole()
        );
    }
}
