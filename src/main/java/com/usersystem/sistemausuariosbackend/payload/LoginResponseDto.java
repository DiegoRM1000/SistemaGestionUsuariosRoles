package com.usersystem.sistemausuariosbackend.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String dni;
    private String role;
    // ➡️ CORRECCIÓN CLAVE: Agrega el campo avatarUrl
    private String avatarUrl;

    // ➡️ Agrega el constructor para casos donde el avatar sea nulo
    public LoginResponseDto(String accessToken, String tokenType, Long id, String firstName, String lastName, String email, String dni, String role) {
        this(accessToken, tokenType, id, firstName, lastName, email, dni, role, null);
    }
}

