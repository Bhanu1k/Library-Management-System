package com.library.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.library.model.Loan;
import com.library.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OverdueReportService {

    private final LoanRepository loanRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    // ── Fetch overdue loans (reuses existing LoanRepository query) ─────────
    public List<Loan> getOverdueLoans() {
        return loanRepository.findOverdueLoans(LocalDate.now());
    }

    // ── Generate PDF ───────────────────────────────────────────────────────
    public byte[] generatePdfReport() {
        List<Loan> loans = getOverdueLoans();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (PdfDocument pdf = new PdfDocument(new PdfWriter(baos));
                Document doc = new Document(pdf)) {

            addHeader(doc, loans.size());
            addSummary(doc, loans);
            addTable(doc, loans);
            addFooter(doc);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }

    // ── PDF Sections ───────────────────────────────────────────────────────

    private void addHeader(Document doc, int count) {
        DeviceRgb navy = new DeviceRgb(30, 58, 95);

        doc.add(new Paragraph("Library Management System")
                .setFontSize(11)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new Paragraph("Overdue Books Report")
                .setFontSize(22)
                .setBold()
                .setFontColor(navy)
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new Paragraph("Generated: " + LocalDate.now().format(FMT)
                + "     |     Total overdue: " + count)
                .setFontSize(10)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20));
    }

    private void addSummary(Document doc, List<Loan> loans) {
        long critical = loans.stream()
                .filter(l -> ChronoUnit.DAYS.between(l.getDueDate(), LocalDate.now()) > 14)
                .count();
        double totalFine = loans.stream()
                .mapToDouble(l -> l.getFineAmount() != null ? l.getFineAmount().doubleValue() : 0)
                .sum();

        DeviceRgb lightGray = new DeviceRgb(245, 247, 250);
        DeviceRgb navy = new DeviceRgb(30, 58, 95);

        Table summary = new Table(UnitValue.createPercentArray(new float[] { 1f, 1f, 1f }))
                .useAllAvailableWidth()
                .setMarginBottom(20);

        addSummaryCell(summary, String.valueOf(loans.size()), "Total Overdue", lightGray, navy);
        addSummaryCell(summary, String.valueOf(critical), "Critical (>14 days)", lightGray, new DeviceRgb(192, 57, 43));
        addSummaryCell(summary, String.format("%.2f", totalFine), "Total Fines (₹)", lightGray, navy);

        doc.add(summary);
    }

    private void addSummaryCell(Table table, String value, String label,
            DeviceRgb bg, DeviceRgb valueColor) {
        Cell cell = new Cell()
                .setBackgroundColor(bg)
                .setPadding(12)
                .setTextAlignment(TextAlignment.CENTER);
        cell.add(new Paragraph(value).setFontSize(20).setBold().setFontColor(valueColor));
        cell.add(new Paragraph(label).setFontSize(10).setFontColor(ColorConstants.GRAY));
        table.addCell(cell);
    }

    private void addTable(Document doc, List<Loan> loans) {
        float[] colWidths = { 2.5f, 3f, 1.5f, 1.5f, 1.5f, 1.5f };
        Table table = new Table(UnitValue.createPercentArray(colWidths))
                .useAllAvailableWidth();

        DeviceRgb headerBg = new DeviceRgb(30, 58, 95);
        String[] headers = { "Member", "Book Title", "Due Date", "Days Overdue", "Fine (₹)", "Status" };

        for (String h : headers) {
            table.addHeaderCell(
                    new Cell()
                            .add(new Paragraph(h).setBold().setFontSize(10).setFontColor(ColorConstants.WHITE))
                            .setBackgroundColor(headerBg)
                            .setTextAlignment(TextAlignment.CENTER)
                            .setPadding(8));
        }

        DeviceRgb rowAlt = new DeviceRgb(245, 248, 255);
        DeviceRgb rowRed = new DeviceRgb(255, 240, 240);

        for (int i = 0; i < loans.size(); i++) {
            Loan loan = loans.get(i);
            long daysOverdue = ChronoUnit.DAYS.between(loan.getDueDate(), LocalDate.now());
            DeviceRgb bg = daysOverdue > 14 ? rowRed : (i % 2 == 0 ? rowAlt : null);

            String memberName = loan.getMember() != null ? loan.getMember().getName() : "—";
            String bookTitle = loan.getBook() != null ? loan.getBook().getTitle() : "—";
            double fine = loan.getFineAmount() != null ? loan.getFineAmount().doubleValue() : 0;
            String status = daysOverdue > 14 ? "CRITICAL" : "OVERDUE";

            addTableCell(table, memberName, bg);
            addTableCell(table, bookTitle, bg);
            addTableCell(table, loan.getDueDate().format(FMT), bg);
            addTableCell(table, daysOverdue + " days", bg);
            addTableCell(table, String.format("%.2f", fine), bg);
            addTableCell(table, status, bg);
        }

        doc.add(table);
    }

    private void addTableCell(Table table, String text, DeviceRgb bg) {
        Cell cell = new Cell()
                .add(new Paragraph(text != null ? text : "—").setFontSize(10))
                .setPadding(7)
                .setTextAlignment(TextAlignment.CENTER);
        if (bg != null)
            cell.setBackgroundColor(bg);
        table.addCell(cell);
    }

    private void addFooter(Document doc) {
        doc.add(new Paragraph(
                "\n* Rows highlighted in red are overdue by more than 14 days (CRITICAL).\n" +
                        "* Fine rate: ₹5 per day, maximum ₹500.")
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setMarginTop(16));
    }
}