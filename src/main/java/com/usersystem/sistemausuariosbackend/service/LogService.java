package com.usersystem.sistemausuariosbackend.service;

import com.usersystem.sistemausuariosbackend.model.LogEntry;
import com.usersystem.sistemausuariosbackend.repository.LogEntryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class LogService {

    private final LogEntryRepository logEntryRepository;

    public LogService(LogEntryRepository logEntryRepository) {
        this.logEntryRepository = logEntryRepository;
    }

    /**
     * Registra una nueva entrada de log en la base de datos.
     * @param eventType Tipo de evento (ej. USER_CREATED, USER_LOGIN)
     * @param username Usuario que realizó la acción
     * @param userId ID del usuario que realizó la acción
     * @param targetUsername Usuario afectado por la acción (si aplica)
     * @param targetUserId ID del usuario afectado (si aplica)
     * @param description Descripción detallada del evento
     * @param result Resultado de la operación (SUCCESS/FAILURE)
     * @param ipAddress Dirección IP de la solicitud
     * @return La LogEntry guardada
     */
    public LogEntry log(String eventType, String username, Long userId,
                        String targetUsername, Long targetUserId,
                        String description, String result, String ipAddress) {
        LogEntry logEntry = new LogEntry();
        // El timestamp se establece automáticamente en el constructor de LogEntry
        logEntry.setEventType(eventType);
        logEntry.setUsername(username);
        logEntry.setUserId(userId);
        logEntry.setTargetUsername(targetUsername);
        logEntry.setTargetUserId(targetUserId);
        logEntry.setDescription(description);
        logEntry.setResult(result);
        logEntry.setIpAddress(ipAddress);
        return logEntryRepository.save(logEntry);
    }

    /**
     * Obtiene una página de entradas de log, con opciones de filtrado.
     * @param eventType Filtro por tipo de evento (puede ser nulo)
     * @param username Filtro por usuario que realizó la acción (puede ser nulo)
     * @param targetUsername Filtro por usuario afectado (puede ser nulo)
     * @param startDate Fecha de inicio del rango (puede ser nulo)
     * @param endDate Fecha de fin del rango (puede ser nulo)
     * @param pageable Objeto Pageable para paginación y ordenamiento
     * @return Una página de LogEntry
     */
    public Page<LogEntry> getLogs(String eventType, String username, String targetUsername,
                                  LocalDateTime startDate, LocalDateTime endDate,
                                  Pageable pageable) {
        // Implementa la lógica de filtrado aquí.
        // Esto puede volverse complejo con muchas combinaciones.
        // Para simplificar, aquí hay un ejemplo básico, pero podrías usar
        // Specifications de JPA o Querydsl para filtros más dinámicos.

        if (eventType != null && username != null && startDate != null && endDate != null) {
            return logEntryRepository.findByEventTypeAndUsernameAndTimestampBetween(
                    eventType, username, startDate, endDate, pageable);
        } else if (eventType != null) {
            return logEntryRepository.findByEventType(eventType, pageable);
        } else if (username != null) {
            return logEntryRepository.findByUsername(username, pageable);
        } else if (targetUsername != null) {
            return logEntryRepository.findByTargetUsername(targetUsername, pageable);
        } else if (startDate != null && endDate != null) {
            return logEntryRepository.findByTimestampBetween(startDate, endDate, pageable);
        } else {
            return logEntryRepository.findAll(pageable);
        }
    }
}