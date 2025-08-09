package com.usersystem.sistemausuariosbackend.repository;

import com.usersystem.sistemausuariosbackend.model.LogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Importaciones para paginación (si planeas implementar paginación en el futuro)
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

@Repository
public interface LogEntryRepository extends JpaRepository<LogEntry, Long> {

    // Puedes añadir métodos de búsqueda personalizados aquí si los necesitas.
    // Ejemplos:
    // Buscar logs por tipo de evento
    Page<LogEntry> findByEventType(String eventType, Pageable pageable);

    // Buscar logs por username (quien realizó la acción)
    Page<LogEntry> findByUsername(String username, Pageable pageable);

    // Buscar logs por targetUsername (quien fue afectado por la acción)
    Page<LogEntry> findByTargetUsername(String targetUsername, Pageable pageable);

    // Buscar logs por rango de fechas
    Page<LogEntry> findByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    // Combinación de filtros
    Page<LogEntry> findByEventTypeAndUsernameAndTimestampBetween(String eventType, String username, LocalDateTime start, LocalDateTime end, Pageable pageable);
}