package com.usersystem.sistemausuariosbackend.repository;

import com.usersystem.sistemausuariosbackend.model.User; // Importa tu modelo User
import org.springframework.data.jpa.repository.JpaRepository; // Importa JpaRepository
import org.springframework.stereotype.Repository; // Indica que es un componente de repositorio
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional; // Para manejar resultados que pueden o no existir

@Repository // Le dice a Spring que esta interfaz es un componente de repositorio
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA generará automáticamente la implementación de este metodo
    Optional<User> findByUsername(String username); // Buscar usuario por nombre de usuario

    // Buscar usuario por email
    Optional<User> findByEmail(String email);

    long countByEnabled(boolean enabled);

    // Consulta para contar usuarios por el nombre del rol
    @Query("SELECT r.name, COUNT(u) FROM User u JOIN u.role r GROUP BY r.name")
    List<Object[]> countUsersByRole();

    // NUEVA CONSULTA
    @Query("SELECT FUNCTION('MONTH', u.createdAt), FUNCTION('YEAR', u.createdAt), COUNT(u) " +
            "FROM User u GROUP BY FUNCTION('MONTH', u.createdAt), FUNCTION('YEAR', u.createdAt) " +
            "ORDER BY FUNCTION('YEAR', u.createdAt) ASC, FUNCTION('MONTH', u.createdAt) ASC")
    List<Object[]> countMonthlyRegistrations();

    // NUEVA CONSULTA
    @Query("SELECT u FROM User u WHERE u.role.name = ?1")
    List<User> findByRoleName(String roleName);

    // ⬅️ Nuevo metodo para buscar por token de recuperación
    Optional<User> findByPasswordResetToken(String token);
    

}