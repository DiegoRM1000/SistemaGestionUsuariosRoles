// src/main/java/com/usersystem/sistemausuariosbackend/service/TwoFactorAuthService.java

package com.usersystem.sistemausuariosbackend.service;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.util.Utils;
import org.springframework.stereotype.Service;

@Service
public class TwoFactorAuthService {

    private final SecretGenerator secretGenerator;
    private final CodeGenerator codeGenerator;
    private final CodeVerifier codeVerifier;
    private final QrGenerator qrGenerator;
    private final TimeProvider timeProvider;

    public TwoFactorAuthService() {
        this.secretGenerator = new DefaultSecretGenerator();
        this.codeGenerator = new DefaultCodeGenerator();
        this.timeProvider = new SystemTimeProvider();
        this.codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        this.qrGenerator = new ZxingPngQrGenerator();
    }

    /**
     * Genera un nuevo secreto aleatorio para la autenticación 2FA.
     * @return El secreto generado como una cadena.
     */
    public String generateNewSecret() {
        return secretGenerator.generate();
    }

    /**
     * Crea la URL de autenticación para que el frontend genere el QR.
     * Esta URL sigue el formato otpauth:// que las apps de autenticación reconocen.
     * @param secret El secreto de 2FA del usuario.
     * @param issuer El nombre del emisor (tu aplicación).
     * @param userEmail El correo electrónico del usuario.
     * @return La URL de autenticación de texto (otpauth://...).
     */
    public String getOtpAuthUrl(String secret, String issuer, String userEmail) {
        QrData data = new QrData.Builder()
                .label(userEmail)
                .secret(secret)
                .issuer(issuer)
                .build();
        return data.getUri();
    }

    /**
     * [Este método ya no se usa, lo puedes eliminar si quieres]
     * Crea la URL para generar el código QR que se usa en aplicaciones de autenticación.
     * @param secret El secreto de 2FA del usuario.
     * @param issuer El nombre del emisor (tu aplicación).
     * @param userEmail El correo electrónico del usuario.
     * @return La URL completa para el código QR.
     */
    public String getQrCodeImageUrl(String secret, String issuer, String userEmail) {
        QrData data = new QrData.Builder()
                .label(userEmail)
                .secret(secret)
                .issuer(issuer)
                .build();
        try {
            return Utils.getDataUriForImage(qrGenerator.generate(data), qrGenerator.getImageMimeType());
        } catch (Exception e) {
            throw new RuntimeException("Error al generar la URL del QR: " + e.getMessage());
        }
    }

    /**
     * Verifica si el código de 2FA proporcionado por el usuario es válido.
     * @param code El código de 6 dígitos ingresado por el usuario.
     * @param secret El secreto de 2FA del usuario almacenado en la base de datos.
     * @return true si el código es válido, false en caso contrario.
     */
    public boolean verifyCode(String code, String secret) {
        return codeVerifier.isValidCode(secret, code);
    }
}