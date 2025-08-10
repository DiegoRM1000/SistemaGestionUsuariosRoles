package com.usersystem.sistemausuariosbackend.controller;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.payload.*;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import com.usersystem.sistemausuariosbackend.service.EmailService;
import com.usersystem.sistemausuariosbackend.service.LogService;
import com.usersystem.sistemausuariosbackend.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.usersystem.sistemausuariosbackend.service.TwoFactorAuthService;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final LogService logService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final TwoFactorAuthService twoFactorAuthService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          JwtUtil jwtUtil,
                          LogService logService,
                          EmailService emailService,
                          PasswordEncoder passwordEncoder,
                          TwoFactorAuthService twoFactorAuthService) { // <-- ¡AÑADE ESTO!
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.logService = logService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.twoFactorAuthService = twoFactorAuthService;

    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginDto loginDto, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();

        if (loginDto.getEmail() == null || loginDto.getPassword() == null) {
            logService.log("LOGIN_ATTEMPT", loginDto.getEmail(), null, null, null,
                    "Intento de login con credenciales incompletas", "FAILURE", ipAddress);
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User loggedInUser = userRepository.findByEmail(loginDto.getEmail()).orElse(null);
            if (loggedInUser == null) {
                return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
            }

            // --- Lógica de 2FA
            if (loggedInUser.isTwoFactorEnabled()) {
                // Genera un token TEMPORAL sin el rol, que solo servirá para el siguiente paso (verificación del 2FA)
                String tempToken = jwtUtil.generateToken((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal());
                return ResponseEntity.ok(new Login2FAResponse(tempToken, "Bearer", "Se requiere código 2FA.", true));
            }
            // --- Fin de la lógica 2FA

            // Si el 2FA NO está habilitado, procede con el login normal
            String token = jwtUtil.generateToken((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal());
            String roleName = loggedInUser.getRole().getName();
            logService.log("USER_LOGIN", loggedInUser.getUsername(), loggedInUser.getId(), null, null,
                    "Inicio de sesión exitoso", "SUCCESS", ipAddress);

            return ResponseEntity.ok(new LoginResponseDto(
                    token, "Bearer", loggedInUser.getId(), loggedInUser.getFirstName(),
                    loggedInUser.getLastName(), loggedInUser.getEmail(), loggedInUser.getDni(), roleName
            ));

        } catch (AuthenticationException e) {
            System.err.println("Authentication failed for email: " + loginDto.getEmail() + " - Error: " + e.getMessage());
            logService.log("LOGIN_ATTEMPT", loginDto.getEmail(), null, null, null,
                    "Intento de login fallido: " + e.getMessage(), "FAILURE", ipAddress);
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }


    // ⬅️ Endpoint para solicitar la recuperación de contraseña
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.ok("Si el correo existe, se ha enviado un enlace.");
        }

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setTokenExpirationDate(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        String recoveryLink = "http://localhost:5173/reset-password?token=" + token;
        // ⬅️ Nuevo diseño del cuerpo del correo electrónico
        String body = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>"
                + "<div style='text-align: center; background-color: #f0f4f8; padding: 20px; border-radius: 8px;'>"
                + "<h1 style='color: #2c3e50;'>Recuperación de Contraseña</h1>"
                + "</div>"
                + "<div style='padding: 20px;'>"
                + "<p style='font-size: 16px; color: #34495e;'>Hola " + user.getFirstName() + ",</p>"
                + "<p style='font-size: 16px; color: #34495e;'>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>"
                + "<div style='text-align: center; margin: 25px 0;'>"
                + "<a href='" + recoveryLink + "' style='background-color: #3498db; color: #ffffff; padding: 15px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;'>"
                + "Restablecer mi Contraseña"
                + "</a>"
                + "</div>"
                + "<p style='font-size: 14px; color: #7f8c8d;'>Este enlace es válido por 1 hora.</p>"
                + "<p style='font-size: 14px; color: #7f8c8d;'>Si no solicitaste un restablecimiento de contraseña, ignora este correo.</p>"
                + "</div>"
                + "<div style='text-align: center; margin-top: 20px; padding: 10px; font-size: 12px; color: #95a5a6;'>"
                + "<p>Sistema de Gestión de Usuarios Nexus &copy; " + java.time.Year.now() + "</p>"
                + "</div>"
                + "</div>";

        emailService.sendEmail(user.getEmail(), "Recuperación de contraseña", body);

        return ResponseEntity.ok("Si el correo existe, se ha enviado un enlace.");
    }

    // ⬅️ Endpoint para restablecer la contraseña
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        // 1. Buscar al usuario por el token de recuperación
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElse(null);

        if (user == null || user.getTokenExpirationDate().isBefore(LocalDateTime.now())) {
            // El token es inválido o ha expirado
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El token es inválido o ha expirado.");
        }

        // ⬅️ La validación de la nueva contraseña ahora se hace automáticamente
        //     gracias a la anotación @Valid en el parámetro.
        //     Ya no necesitas el 'if' con newPassword.matches(...)

        // 2. Codificar y guardar la nueva contraseña
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setTokenExpirationDate(null);
        userRepository.save(user);

        return ResponseEntity.ok("Contraseña restablecida exitosamente.");
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2fa(@RequestHeader("Authorization") String token,
                                       @RequestBody TwoFactorAuthRequest twoFactorAuthRequest,
                                       HttpServletRequest request) {

        String jwtToken = token.substring(7); // Remueve "Bearer "
        // --- Corregimos el nombre del método a 'extractUsername'
        String email = jwtUtil.extractUsername(jwtToken);

        return userRepository.findByEmail(email).map(user -> {
            if (twoFactorAuthService.verifyCode(twoFactorAuthRequest.getVerificationCode(), user.getTwoFactorSecret())) {

                // --- Corregimos el método generateToken
                // Necesitamos un objeto UserDetails para generar el token final
                // Asumimos que tu clase User implementa UserDetails, si no es así,
                // habría que crear una implementación
                UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        user.getAuthorities() // Asume que tienes un getAuthorities en User
                );
                String finalToken = jwtUtil.generateToken(userDetails);

                String roleName = user.getRole().getName();

                String ipAddress = request.getRemoteAddr();
                logService.log("USER_LOGIN_2FA", user.getUsername(), user.getId(), null, null,
                        "Inicio de sesión 2FA exitoso", "SUCCESS", ipAddress);

                return ResponseEntity.ok(new LoginResponseDto(
                        finalToken, "Bearer", user.getId(), user.getFirstName(),
                        user.getLastName(), user.getEmail(), user.getDni(), roleName
                ));

            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Código de 2FA inválido.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}