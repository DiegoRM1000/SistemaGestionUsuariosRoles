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

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                log.error("Error extracting username or invalid JWT token: {}", e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // ➡️ CORRECCIÓN: Maneja cualquier excepción durante la validación del token.
            try {
                if (jwtUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                log.error("Token validation failed for user {}: {}", username, e.getMessage());
                // No hacemos nada, el SecurityContext se mantiene nulo y el flujo continúa
                // para ser manejado por el AuthenticationEntryPoint.
            }
        }

        filterChain.doFilter(request, response);
    }
    }