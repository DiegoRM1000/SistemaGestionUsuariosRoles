package com.usersystem.sistemausuariosbackend.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TwoFactorAuthRequest {

    @NotBlank(message = "El código de verificación no puede estar vacío")
    @Size(min = 6, max = 6, message = "El código de verificación debe tener 6 dígitos")
    private String verificationCode;

    // Getters y Setters
    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }
}