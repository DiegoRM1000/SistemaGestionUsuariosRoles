// src/main/java/com/usersystem/sistemausuariosbackend/controller/ExportController.java

package com.usersystem.sistemausuariosbackend.controller;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.service.UserService;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/exports")
public class ExportController {

    private final UserService userService;

    public ExportController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/pdf")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<byte[]> exportUsersToPdf() throws DocumentException, IOException {
        List<User> users = userService.getAllUsers();
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        document.open();

        com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
        Paragraph title = new Paragraph("Reporte de Usuarios del Sistema", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        PdfPTable table = new PdfPTable(10);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setSpacingAfter(10);
        table.setWidths(new float[]{0.5f, 1.5f, 1.5f, 1.5f, 1.5f, 1f, 1.5f, 1f, 1f, 1f});

        addPdfTableHeader(table);

        users.forEach(user -> addUserDataToPdf(table, user));

        document.add(table);
        document.close();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users_report.pdf");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(baos.toByteArray());
    }

    private void addPdfTableHeader(PdfPTable table) {
        String[] headers = {"ID", "Username", "Email", "Nombre", "Apellido", "DNI", "Fecha Nac.", "Teléfono", "Rol", "Estado"};
        com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
        BaseColor headerColor = new BaseColor(46, 117, 182);

        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setBackgroundColor(headerColor);
            cell.setBorderColor(BaseColor.WHITE);
            cell.setPadding(5);
            table.addCell(cell);
        }
    }

    private void addUserDataToPdf(PdfPTable table, User user) {
        table.addCell(String.valueOf(user.getId()));
        table.addCell(user.getUsername());
        table.addCell(user.getEmail());
        table.addCell(user.getFirstName());
        table.addCell(user.getLastName());
        table.addCell(user.getDni() != null ? user.getDni() : "");
        table.addCell(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : "");
        table.addCell(user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
        table.addCell(user.getRole().getName());
        table.addCell(user.isEnabled() ? "Activo" : "Inactivo");
    }

    @GetMapping("/users/excel")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<byte[]> exportUsersToExcel() throws IOException {
        List<User> users = userService.getAllUsers();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Usuarios");

        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setColor(IndexedColors.WHITE.getIndex());

        org.apache.poi.ss.usermodel.CellStyle headerCellStyle = workbook.createCellStyle();
        headerCellStyle.setFont(headerFont);
        headerCellStyle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
        headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerCellStyle.setBorderBottom(BorderStyle.THIN);
        headerCellStyle.setBorderTop(BorderStyle.THIN);
        headerCellStyle.setBorderLeft(BorderStyle.THIN);
        headerCellStyle.setBorderRight(BorderStyle.THIN);
        headerCellStyle.setBottomBorderColor(IndexedColors.WHITE.getIndex());
        headerCellStyle.setTopBorderColor(IndexedColors.WHITE.getIndex());
        headerCellStyle.setLeftBorderColor(IndexedColors.WHITE.getIndex());
        headerCellStyle.setRightBorderColor(IndexedColors.WHITE.getIndex());
        headerCellStyle.setAlignment(HorizontalAlignment.CENTER);
        headerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Username", "Email", "Nombre", "Apellido", "DNI", "Fecha Nacimiento", "Teléfono", "Rol", "Estado"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerCellStyle);
        }

        org.apache.poi.ss.usermodel.CellStyle dataCellStyle = workbook.createCellStyle();
        dataCellStyle.setBorderBottom(BorderStyle.THIN);
        dataCellStyle.setBorderTop(BorderStyle.THIN);
        dataCellStyle.setBorderLeft(BorderStyle.THIN);
        dataCellStyle.setBorderRight(BorderStyle.THIN);
        dataCellStyle.setBottomBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        dataCellStyle.setTopBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        dataCellStyle.setLeftBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        dataCellStyle.setRightBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());

        int rowNum = 1;
        for (User user : users) {
            Row row = sheet.createRow(rowNum++);
            Cell cell0 = row.createCell(0);
            cell0.setCellValue(user.getId());
            cell0.setCellStyle(dataCellStyle);

            Cell cell1 = row.createCell(1);
            cell1.setCellValue(user.getUsername());
            cell1.setCellStyle(dataCellStyle);

            Cell cell2 = row.createCell(2);
            cell2.setCellValue(user.getEmail());
            cell2.setCellStyle(dataCellStyle);

            Cell cell3 = row.createCell(3);
            cell3.setCellValue(user.getFirstName());
            cell3.setCellStyle(dataCellStyle);

            Cell cell4 = row.createCell(4);
            cell4.setCellValue(user.getLastName());
            cell4.setCellStyle(dataCellStyle);

            Cell cell5 = row.createCell(5);
            cell5.setCellValue(user.getDni() != null ? user.getDni() : "");
            cell5.setCellStyle(dataCellStyle);

            Cell cell6 = row.createCell(6);
            cell6.setCellValue(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : "");
            cell6.setCellStyle(dataCellStyle);

            Cell cell7 = row.createCell(7);
            cell7.setCellValue(user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
            cell7.setCellStyle(dataCellStyle);

            Cell cell8 = row.createCell(8);
            cell8.setCellValue(user.getRole().getName());
            cell8.setCellStyle(dataCellStyle);

            Cell cell9 = row.createCell(9);
            cell9.setCellValue(user.isEnabled() ? "Activo" : "Inactivo");
            cell9.setCellStyle(dataCellStyle);
        }

        for(int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        HttpHeaders headersResponse = new HttpHeaders();
        headersResponse.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users_report.xlsx");
        return ResponseEntity.ok()
                .headers(headersResponse)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(baos.toByteArray());
    }
}