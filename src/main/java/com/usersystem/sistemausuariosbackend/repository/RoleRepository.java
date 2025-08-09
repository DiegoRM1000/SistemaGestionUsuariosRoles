package com.usersystem.sistemausuariosbackend.repository;

import com.usersystem.sistemausuariosbackend.model.Role; // Importa tu modelo Role
import org.springframework.data.jpa.repository.JpaRepository; // Importa JpaRepository
import org.springframework.stereotype.Repository; // Indica que es un componente de repositorio

import java.util.Optional;

@Repository // Le dice a Spring que esta interfaz es un componente de repositorio
public interface RoleRepository extends JpaRepository<Role, Long> {
    // Buscar un rol por su nombre
    Optional<Role> findByName(String name);
}