package com.usersystem.sistemausuariosbackend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import org.springframework.security.core.GrantedAuthority; // <-- ¡AÑADE ESTA LÍNEA!
import java.util.stream.Collectors;
import org.slf4j.Logger; // Añade este import
import org.slf4j.LoggerFactory; // Añade este import
import io.jsonwebtoken.ExpiredJwtException; // Añade este import
import io.jsonwebtoken.MalformedJwtException; // Añade este import
import io.jsonwebtoken.SignatureException; // Añade este import
import io.jsonwebtoken.UnsupportedJwtException; // Añade este import

@Component // Indica que esta clase es un componente de Spring y será gestionada por el contenedor
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class); // Añade esto

    @Value("${jwt.secret}") // Inyecta el secreto JWT desde application.properties
    private String secret;

    @Value("${jwt.expiration}") // Inyecta el tiempo de expiración JWT desde application.properties
    private long expiration; // En milisegundos

    // Genera el token JWT para un usuario
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Aquí puedes añadir claims adicionales como roles si lo necesitas
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        return createToken(claims, userDetails.getUsername());
    }

    // Crea el token con los claims, el sujeto (username) y la fecha de expiración
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims) // Carga los claims
                .setSubject(subject) // El "sujeto" del token (normalmente el username)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Fecha de emisión
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // Fecha de expiración
                .signWith(getSignKey(), SignatureAlgorithm.HS256) // Firma el token con la clave secreta
                .compact(); // Construye el token
    }

    // Obtiene la clave de firma decodificando el secreto
    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Extrae el username del token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extrae la fecha de expiración del token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Extrae un claim específico del token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extrae todos los claims del token
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
            throw ex; // Re-lanza para que se maneje en el filtro o controlador
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
            throw ex;
        } catch (ExpiredJwtException ex) {
            log.error("JWT token is expired: {}", ex.getMessage());
            throw ex;
        } catch (UnsupportedJwtException ex) {
            log.error("JWT token is unsupported: {}", ex.getMessage());
            throw ex;
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
            throw ex;
        }
    }


    // Valida si el token es válido para el usuario y si no ha expirado
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean isValid = (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
            if (!isValid) {
                log.warn("Token validation failed for user {}. Username match: {}, Token expired: {}",
                        username, username.equals(userDetails.getUsername()), isTokenExpired(token));
            }
            return isValid;
        } catch (Exception e) {
            log.error("Error during token validation: {}", e.getMessage());
            return false;
        }
    }

    // Verifica si el token ha expirado
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}