package com.usersystem.sistemausuariosbackend.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;



public class ResetPasswordRequest {
    @NotBlank
    private String token;

    // ⬅️ Reemplaza @Size por @Pattern para la validación de complejidad
    @NotBlank
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,64}$",
            message = "La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una minúscula, un número y un carácter especial (@#$%^&+=!)")
    private String newPassword;


    // Getters y setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}