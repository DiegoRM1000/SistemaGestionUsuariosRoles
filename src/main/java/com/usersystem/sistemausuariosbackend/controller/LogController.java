package com.usersystem.sistemausuariosbackend.controller;

import com.usersystem.sistemausuariosbackend.model.LogEntry;
import com.usersystem.sistemausuariosbackend.service.LogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @GetMapping
    // CORRECCIÓN: Se usa hasAnyAuthority para validar el rol sin el prefijo 'ROLE_'
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<Page<LogEntry>> getLogs(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String targetUsername,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp,desc") String[] sort
    ) {
        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;

        if (startDate != null && !startDate.isEmpty()) {
            try {
                startDateTime = LocalDateTime.parse(startDate + "T00:00:00");
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        if (endDate != null && !endDate.isEmpty()) {
            try {
                endDateTime = LocalDateTime.parse(endDate + "T23:59:59");
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        Sort sorting = Sort.by(sort[0]);
        if (sort.length > 1 && sort[1].equalsIgnoreCase("desc")) {
            sorting = sorting.descending();
        } else {
            sorting = sorting.ascending();
        }

        Pageable pageable = PageRequest.of(page, size, sorting);
        Page<LogEntry> logs = logService.getLogs(eventType, username, targetUsername, startDateTime, endDateTime, pageable);
        return ResponseEntity.ok(logs);
    }
}