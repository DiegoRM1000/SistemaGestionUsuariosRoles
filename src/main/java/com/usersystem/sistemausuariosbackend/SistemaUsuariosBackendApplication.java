package com.usersystem.sistemausuariosbackend;

import com.usersystem.sistemausuariosbackend.model.Role;
import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.repository.RoleRepository;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
public class SistemaUsuariosBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaUsuariosBackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner run(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Crear los roles si no existen con los nuevos nombres
			Role adminRole = roleRepository.findByName("ADMIN")
					.orElseGet(() -> {
						Role newRole = new Role();
						newRole.setName("ADMIN");
						System.out.println("Rol ADMIN creado.");
						return roleRepository.save(newRole);
					});

			Role employeeRole = roleRepository.findByName("EMPLEADO")
					.orElseGet(() -> {
						Role newRole = new Role();
						newRole.setName("EMPLEADO");
						System.out.println("Rol EMPLEADO creado.");
						return roleRepository.save(newRole);
					});

			Role supervisorRole = roleRepository.findByName("SUPERVISOR")
					.orElseGet(() -> {
						Role newRole = new Role();
						newRole.setName("SUPERVISOR");
						System.out.println("Rol SUPERVISOR creado.");
						return roleRepository.save(newRole);
					});


			// 2. Crear usuarios de prueba si no existen
			// Usuario ADMIN con datos completos y válidos
			if (userRepository.findByUsername("MarcelR").isEmpty()) {
				User adminUser = new User();
				adminUser.setUsername("MarcelR");
				adminUser.setEmail("marcelita@gmail.com");
				adminUser.setPassword(passwordEncoder.encode("MAR@ssword123")); // Contraseña más segura
				adminUser.setFirstName("Marcela");
				adminUser.setLastName("Rojas");
				adminUser.setDni("87654321");
				adminUser.setDateOfBirth(LocalDate.of(1982, 3, 10));
				adminUser.setPhoneNumber("998877665");
				adminUser.setEnabled(true);
				adminUser.setCreatedAt(LocalDateTime.now());
				adminUser.setUpdatedAt(LocalDateTime.now());
				adminUser.setRole(adminRole);
				userRepository.save(adminUser);
				System.out.println("Usuario 'superadmin' creado con rol ADMIN.");
			}

			// Usuario SUPERVISOR con datos completos y válidos
			if (userRepository.findByUsername("AndreSuper").isEmpty()) {
				User supervisorUser = new User();
				supervisorUser.setUsername("AndreSuper");
				supervisorUser.setEmail("andreC@gmail.com");
				supervisorUser.setPassword(passwordEncoder.encode("AndresSPVP@ss456"));
				supervisorUser.setFirstName("Andres");
				supervisorUser.setLastName("Campos");
				supervisorUser.setDni("12345678");
				supervisorUser.setDateOfBirth(LocalDate.of(1989, 7, 25));
				supervisorUser.setPhoneNumber("954321098");
				supervisorUser.setEnabled(true);
				supervisorUser.setCreatedAt(LocalDateTime.now());
				supervisorUser.setUpdatedAt(LocalDateTime.now());
				supervisorUser.setRole(supervisorRole);
				userRepository.save(supervisorUser);
				System.out.println("Usuario 'supervisor_jefe' creado con rol SUPERVISOR.");
			}

			// Usuario EMPLEADO con datos completos y válidos
			if (userRepository.findByUsername("LauF").isEmpty()) {
				User employeeUser = new User();
				employeeUser.setUsername("LauF");
				employeeUser.setEmail("lauF@gmail.com");
				employeeUser.setPassword(passwordEncoder.encode("EmpLauraP@ss789"));
				employeeUser.setFirstName("Laura");
				employeeUser.setLastName("Fernandez");
				employeeUser.setDni("45678901");
				employeeUser.setDateOfBirth(LocalDate.of(1995, 11, 5));
				employeeUser.setPhoneNumber("912345678");
				employeeUser.setEnabled(true);
				employeeUser.setCreatedAt(LocalDateTime.now());
				employeeUser.setUpdatedAt(LocalDateTime.now());
				employeeUser.setRole(employeeRole);
				userRepository.save(employeeUser);
				System.out.println("Usuario 'empleado_general' creado con rol EMPLEADO.");
			}

			// Un usuario adicional para tener más datos en la tabla
			if (userRepository.findByUsername("LucasVR").isEmpty()) {
				User employeeUser2 = new User();
				employeeUser2.setUsername("LucasVR");
				employeeUser2.setEmail("lucasvr@gmail.com");
				employeeUser2.setPassword(passwordEncoder.encode("lucasVrP@ss123"));
				employeeUser2.setFirstName("Lucas");
				employeeUser2.setLastName("Vazquez");
				employeeUser2.setDni("98765432");
				employeeUser2.setDateOfBirth(LocalDate.of(1992, 1, 30));
				employeeUser2.setPhoneNumber("987612345");
				employeeUser2.setEnabled(false); // Este usuario estará inactivo por defecto
				employeeUser2.setCreatedAt(LocalDateTime.now());
				employeeUser2.setUpdatedAt(LocalDateTime.now());
				employeeUser2.setRole(employeeRole);
				userRepository.save(employeeUser2);
				System.out.println("Usuario 'otro_empleado' creado con rol EMPLEADO.");
			}
		};
	}
}