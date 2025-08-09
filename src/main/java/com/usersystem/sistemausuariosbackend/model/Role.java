package com.usersystem.sistemausuariosbackend.model;

import jakarta.persistence.*; // Importa clases de JPA
import lombok.Data; // Importa anotación @Data de Lombok
import lombok.NoArgsConstructor; // Importa anotación @NoArgsConstructor de Lombok
import lombok.AllArgsConstructor; // Importa anotación @AllArgsConstructor de Lombok

@Entity // Indica que esta clase es una entidad JPA
@Table(name = "roles") // Especifica el nombre de la tabla en la DB
@Data // Genera automáticamente getters, setters, toString, equals y hashCode con Lombok
@NoArgsConstructor // Genera un constructor sin argumentos
@AllArgsConstructor // Genera un constructor con todos los argumentos
public class Role {
    @Id // Indica que este campo es la clave primaria
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Estrategia para autoincrementar el ID
    private Long id;

    @Column(unique = true, nullable = false, length = 50) // Mapea a una columna, única, no nula, con longitud
    private String name;
}