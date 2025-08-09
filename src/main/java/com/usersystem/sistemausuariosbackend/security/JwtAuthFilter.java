package com.usersystem.sistemausuariosbackend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// --- IMPORTACIONES PARA LOGGING ---
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// --- FIN IMPORTACIONES LOGGING ---

@Component // Indica que esta clase es un componente de Spring
public class JwtAuthFilter extends OncePerRequestFilter {

    // --- INSTANCIA DEL LOGGER ---
    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
    // --- FIN INSTANCIA DEL LOGGER ---

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    // Inyección de dependencias para JwtUtil y UserDetailsServiceImpl
    public JwtAuthFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization"); // Obtiene el encabezado Authorization
        String token = null;
        String username = null;

        log.info("Processing request for URI: {}", request.getRequestURI()); // Log de inicio

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            log.info("Authorization Header found. Token extracted.");
            try {
                username = jwtUtil.extractUsername(token);
                log.info("Username extracted from token: {}", username);
            } catch (Exception e) {
                log.error("Error extracting username or invalid JWT token: {}", e.getMessage()); // Log de error si el token es inválido
            }
        } else {
            log.warn("No Authorization header or does not start with Bearer for URI: {}", request.getRequestURI());
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            log.info("Attempting to load UserDetails for username: {}", username);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(token, userDetails)) {
                log.info("Token validated successfully for user: {}", username);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.info("User {} authenticated and set in SecurityContext.", username);
            } else {
                log.warn("Token validation failed for user: {}", username); // Log si la validación falla
            }
        } else if (SecurityContextHolder.getContext().getAuthentication() != null) {
            log.info("SecurityContext already has authentication for user: {}", SecurityContextHolder.getContext().getAuthentication().getName());
        }

        filterChain.doFilter(request, response);
    }
}