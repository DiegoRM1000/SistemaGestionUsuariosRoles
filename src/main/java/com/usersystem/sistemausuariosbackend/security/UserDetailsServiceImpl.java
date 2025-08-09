// src/main/java/com/usersystem/sistemausuariosbackend/security/UserDetailsServiceImpl.java
package com.usersystem.sistemausuariosbackend.security;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.model.Role; // Importar la entidad Role
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collection;
// import java.util.Set; // Ya no necesitamos Set
import java.util.Collections; // Importar Collections para singletons

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        // --- CAMBIO CLAVE: Mapear el único rol a una colección de GrantedAuthority ---
        Collection<? extends GrantedAuthority> authorities = mapRoleToAuthorities(user.getRole()); // Ahora pasamos el único objeto Role
        // --- FIN CAMBIO CLAVE ---

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isEnabled(),
                true,
                true,
                true,
                authorities
        );
    }

    // --- CAMBIO CLAVE: Método auxiliar para mapear UN solo Role a GrantedAuthority ---
    private Collection<? extends GrantedAuthority> mapRoleToAuthorities(Role role){
        // Si el rol es nulo por alguna razón (no debería serlo por el optional=false en @ManyToOne),
        // devolvemos una colección vacía.
        if (role == null) {
            return Collections.emptyList();
        }
        return Collections.singletonList(new SimpleGrantedAuthority(role.getName()));
    }
    // --- FIN CAMBIO CLAVE ---
}