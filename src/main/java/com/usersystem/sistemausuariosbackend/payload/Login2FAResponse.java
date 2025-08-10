package com.usersystem.sistemausuariosbackend.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Login2FAResponse {
    private String token;
    private String tokenType = "Bearer";
    private String message;
    private boolean is2faRequired;
}