// src/main/java/com/usersystem/sistemausuariosbackend/model/User.java

package com.usersystem.sistemausuariosbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "username")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    // ... (campos existentes, desde id hasta role) ...
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de usuario no puede estar vacío")
    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @NotBlank(message = "El email no puede estar vacío")
    @Email(message = "El formato del email no es válido")
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @NotBlank(message = "La contraseña no puede estar vacía")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,64}$",
            message = "La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una minúscula, un número y un carácter especial (@#$%^&+=!)")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
    @Column(name = "first_name", length = 50)
    private String firstName;

    @NotBlank(message = "El apellido no puede estar vacío")
    @Size(max = 50, message = "El apellido no puede exceder los 50 caracteres")
    @Column(name = "last_name", length = 50)
    private String lastName;

    @Size(min = 8, max = 8, message = "El DNI debe tener entre 8 digitos")
    @Pattern(regexp = "^[0-9]*$", message = "El DNI solo puede contener números")
    @Column(name = "dni", unique = true, length = 15)
    private String dni;

    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Size(min = 9, max = 9, message = "El número de teléfono debe tener 9 dígitos")
    @Pattern(regexp = "^[0-9]*$", message = "El número de teléfono solo puede contener números")
    @Column(name = "phone_number", length = 9)
    private String phoneNumber;

    @Column(nullable = false)
    private boolean enabled = true;

    // Campos de 2FA y metadatos
    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    @Column(name = "two_factor_enabled", nullable = false)
    private boolean twoFactorEnabled = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    @NotNull(message = "El rol no puede ser nulo")
    private Role role;

    // ⬅️ NUEVOS CAMPOS para la recuperación de contraseña
    @Column(name = "password_reset_token", length = 36)
    private String passwordResetToken;

    @Column(name = "token_expiration_date")
    private LocalDateTime tokenExpirationDate;

    @Column(length = 255)
    private String avatarUrl; // ⬅️ CAMBIADO


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ⬅️ Agrega getters y setters para los nuevos campos
    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }

    public LocalDateTime getTokenExpirationDate() {
        return tokenExpirationDate;
    }

    public void setTokenExpirationDate(LocalDateTime tokenExpirationDate) {
        this.tokenExpirationDate = tokenExpirationDate;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.getName()));
    }
}