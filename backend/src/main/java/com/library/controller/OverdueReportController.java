package com.library.controller;

import com.library.model.Loan;
import com.library.service.OverdueReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class OverdueReportController {

    private final OverdueReportService overdueReportService;

    // GET /api/reports/overdue — returns JSON list (used by existing loans tab)
    @GetMapping("/overdue")
    public ResponseEntity<List<Loan>> getOverdueReport() {
        return ResponseEntity.ok(overdueReportService.getOverdueLoans());
    }

    // GET /api/reports/overdue/export/pdf — downloads PDF
    @GetMapping("/overdue/export/pdf")
    public ResponseEntity<byte[]> exportOverduePdf() {
        byte[] pdf = overdueReportService.generatePdfReport();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("overdue-report-" + LocalDate.now() + ".pdf")
                        .build());

        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}