package com.usersystem.sistemausuariosbackend.payload;

import lombok.Data;
@Data
public class LoginDto {
    private String email;
    private String password;
}