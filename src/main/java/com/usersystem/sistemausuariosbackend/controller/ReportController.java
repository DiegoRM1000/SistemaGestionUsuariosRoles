// src/main/java/com/usersystem/sistemausuariosbackend/controller/ReportController.java
package com.usersystem.sistemausuariosbackend.controller;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import com.usersystem.sistemausuariosbackend.repository.RoleRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyAuthority('ADMIN','SUPERVISOR')") // Solo los administradores pueden ver los reportes
public class ReportController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public ReportController(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getUserSummary() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabled(true);
        long inactiveUsers = userRepository.countByEnabled(false);

        Map<String, Long> summary = new HashMap<>();
        summary.put("totalUsers", totalUsers);
        summary.put("activeUsers", activeUsers);
        summary.put("inactiveUsers", inactiveUsers);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/users-by-role")
    public ResponseEntity<Map<String, Long>> getUsersCountByRole() {
        List<Object[]> userCounts = userRepository.countUsersByRole();
        Map<String, Long> userCountsByRole = userCounts.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0], // Nombre del rol
                        row -> (Long) row[1]     // Cantidad de usuarios
                ));

        return ResponseEntity.ok(userCountsByRole);
    }
    // NUEVO ENDPOINT
    @GetMapping("/monthly-registrations")
    public ResponseEntity<List<Object[]>> getMonthlyUserRegistrations() {
        List<Object[]> monthlyRegistrations = userRepository.countMonthlyRegistrations();
        return ResponseEntity.ok(monthlyRegistrations);
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<byte[]> exportUsersToPdf() throws DocumentException, IOException {
        List<User> users;
        // ⬅️ CAMBIO: Obtenemos el usuario autenticado
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // ⬅️ CAMBIO: Filtramos la lista de usuarios según el rol
        if (authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("SUPERVISOR"))) {
            users = userRepository.findByRoleName("EMPLEADO");
        } else {
            users = userRepository.findAll();
        }

        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);

        document.open();
        // ... resto del código sin cambios ...
        com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD, BaseColor.DARK_GRAY);
        Paragraph title = new Paragraph("Reporte de Usuarios del Sistema", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(10f);

        String[] headers = {"ID", "Nombre Completo", "Username", "Email", "DNI", "Rol", "Estado"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 10, com.itextpdf.text.Font.BOLD, BaseColor.WHITE)));
            cell.setBackgroundColor(new BaseColor(63, 81, 181));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(8);
            table.addCell(cell);
        }

        for (User user : users) {
            table.addCell(createCell(String.valueOf(user.getId()), Element.ALIGN_CENTER));
            table.addCell(createCell(user.getFirstName() + " " + user.getLastName(), Element.ALIGN_LEFT));
            table.addCell(createCell(user.getUsername(), Element.ALIGN_LEFT));
            table.addCell(createCell(user.getEmail(), Element.ALIGN_LEFT));
            table.addCell(createCell(user.getDni(), Element.ALIGN_CENTER));
            table.addCell(createCell(user.getRole().getName(), Element.ALIGN_CENTER));
            table.addCell(createCell(user.isEnabled() ? "Activo" : "Inactivo", Element.ALIGN_CENTER));
        }

        document.add(table);
        document.close();

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add("Content-Disposition", "attachment; filename=reporte_usuarios.pdf");

        return new ResponseEntity<>(baos.toByteArray(), httpHeaders, HttpStatus.OK);
    }

    // Método auxiliar para crear celdas
    private PdfPCell createCell(String content, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(content, new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 9)));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(6);
        return cell;
    }

    /**
     * Exporta la lista de todos los usuarios a un archivo Excel con un diseño profesional.
     */
    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<byte[]> exportUsersToExcel() throws IOException {
        List<User> users;
        // ⬅️ CAMBIO: Obtenemos el usuario autenticado
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // ⬅️ CAMBIO: Filtramos la lista de usuarios según el rol
        if (authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("SUPERVISOR"))) {
            users = userRepository.findByRoleName("EMPLEADO");
        } else {
            users = userRepository.findAll();
        }

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Usuarios");

        CellStyle headerStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Nombre", "Apellido", "Username", "Email", "DNI", "Teléfono", "Fecha de Nacimiento", "Rol", "Estado"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

        for (User user : users) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(user.getId());
            row.createCell(1).setCellValue(user.getFirstName());
            row.createCell(2).setCellValue(user.getLastName());
            row.createCell(3).setCellValue(user.getUsername());
            row.createCell(4).setCellValue(user.getEmail());
            row.createCell(5).setCellValue(user.getDni());
            row.createCell(6).setCellValue(user.getPhoneNumber());
            if (user.getDateOfBirth() != null) {
                row.createCell(7).setCellValue(user.getDateOfBirth().format(formatter));
            } else {
                row.createCell(7).setCellValue("");
            }
            row.createCell(8).setCellValue(user.getRole().getName());
            row.createCell(9).setCellValue(user.isEnabled() ? "Activo" : "Inactivo");
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        httpHeaders.add("Content-Disposition", "attachment; filename=reporte_usuarios.xlsx");

        return new ResponseEntity<>(baos.toByteArray(), httpHeaders, HttpStatus.OK);
    }

}