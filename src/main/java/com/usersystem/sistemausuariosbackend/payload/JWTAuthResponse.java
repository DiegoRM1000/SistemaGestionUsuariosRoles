package com.usersystem.sistemausuariosbackend.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor // Lombok debería generar un constructor con todos los campos
public class JWTAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String role; // Campo para el rol del usuario

    // --- ¡AÑADE ESTE CONSTRUCTOR EXPLÍCITO! ---
    // Este constructor asegura que siempre tengamos uno que toma el token y el rol
    public JWTAuthResponse(String accessToken, String role) {
        this.accessToken = accessToken;
        this.role = role;
        // El 'tokenType' se inicializa con el valor por defecto "Bearer"
        this.tokenType = "Bearer";
    }
    // --- FIN DEL CONSTRUCTOR EXPLÍCITO ---
}