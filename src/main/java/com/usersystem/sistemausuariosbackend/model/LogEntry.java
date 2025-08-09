    package com.usersystem.sistemausuariosbackend.model;

    import jakarta.persistence.*;
    import java.time.LocalDateTime;

    @Entity
    @Table(name = "log_entries") // Nombre de la tabla en la base de datos
    public class LogEntry {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private LocalDateTime timestamp;

        @Column(nullable = false, length = 50)
        private String eventType; // Ej: USER_LOGIN, USER_CREATED, USER_STATUS_CHANGE

        @Column(length = 100) // Nombre de usuario que realizó la acción
        private String username;

        @Column // ID del usuario que realizó la acción (puede ser null si el evento no tiene un user_id asociado, ej. login fallido de un usuario inexistente)
        private Long userId;

        @Column(length = 100) // Nombre de usuario afectado por la acción (ej. el usuario cuyo estado fue cambiado)
        private String targetUsername;

        @Column // ID del usuario afectado por la acción
        private Long targetUserId;

        @Column(columnDefinition = "TEXT") // Descripción detallada del evento
        private String description;

        @Column(nullable = false, length = 20)
        private String result; // Ej: SUCCESS, FAILURE

        @Column(length = 45) // IP desde donde se realizó la acción
        private String ipAddress;

        // --- Constructor sin argumentos (necesario para JPA) ---
        public LogEntry() {
            this.timestamp = LocalDateTime.now(); // Establece el timestamp por defecto al crear el objeto
        }

        // --- Getters y Setters ---
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        // No se recomienda un setter público para timestamp si se genera automáticamente
        // public void setTimestamp(LocalDateTime timestamp) {
        //     this.timestamp = timestamp;
        // }

        public String getEventType() {
            return eventType;
        }

        public void setEventType(String eventType) {
            this.eventType = eventType;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getTargetUsername() {
            return targetUsername;
        }

        public void setTargetUsername(String targetUsername) {
            this.targetUsername = targetUsername;
        }

        public Long getTargetUserId() {
            return targetUserId;
        }

        public void setTargetUserId(Long targetUserId) {
            this.targetUserId = targetUserId;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getResult() {
            return result;
        }

        public void setResult(String result) {
            this.result = result;
        }

        public String getIpAddress() {
            return ipAddress;
        }

        public void setIpAddress(String ipAddress) {
            this.ipAddress = ipAddress;
        }

        @Override
        public String toString() {
            return "LogEntry{" +
                    "id=" + id +
                    ", timestamp=" + timestamp +
                    ", eventType='" + eventType + '\'' +
                    ", username='" + username + '\'' +
                    ", userId=" + userId +
                    ", targetUsername='" + targetUsername + '\'' +
                    ", targetUserId=" + targetUserId +
                    ", description='" + description + '\'' +
                    ", result='" + result + '\'' +
                    ", ipAddress='" + ipAddress + '\'' +
                    '}';
        }
    }