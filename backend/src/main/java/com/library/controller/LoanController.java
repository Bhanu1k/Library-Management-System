package com.library.controller;

import com.library.dto.IssueLoanRequest;
import com.library.model.Loan;
import com.library.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @GetMapping
    public ResponseEntity<List<Loan>> getLoans(@RequestParam(required = false) String status) {
        if ("ACTIVE".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(loanService.getActiveLoans());
        } else if ("RETURNED".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(loanService.getReturnedLoans());
        }
        return ResponseEntity.ok(loanService.getActiveLoans());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Loan>> getOverdueLoans() {
        return ResponseEntity.ok(loanService.getOverdueLoans());
    }

    @GetMapping("/fines/unpaid")
    public ResponseEntity<List<Loan>> getLoansWithUnpaidFines() {
        return ResponseEntity.ok(loanService.getLoansWithUnpaidFines());
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Loan>> getMemberLoans(@PathVariable Long memberId) {
        return ResponseEntity.ok(loanService.getLoansByMember(memberId));
    }

    @PostMapping("/issue")
    public ResponseEntity<Loan> issueBook(@RequestBody IssueLoanRequest request) {
        return ResponseEntity.ok(loanService.issueBook(request.getBookId(), request.getMemberId()));
    }

    @PostMapping("/borrow/{bookId}")
    public ResponseEntity<Loan> selfBorrowBook(@PathVariable Long bookId, java.security.Principal principal) {
        if (principal == null) throw new RuntimeException("User not authenticated.");
        return ResponseEntity.ok(loanService.issueBookToUsername(bookId, principal.getName()));
    }

    @PutMapping("/return/{loanId}")
    public ResponseEntity<?> returnBook(@PathVariable Long loanId) {
        Loan loan = loanService.returnBook(loanId);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Book returned successfully.");
        response.put("fineAmount", loan.getFineAmount());
        response.put("returnDate", loan.getReturnDate().toString());
        response.put("status", loan.getStatus().name());
        return ResponseEntity.ok(response);
    }

    // PUT /api/loans/{id}/pay-fine — mark fine as paid
    @PutMapping("/{loanId}/pay-fine")
    public ResponseEntity<?> markFinePaid(@PathVariable Long loanId) {
        Loan loan = loanService.markFinePaid(loanId);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Fine marked as paid successfully.");
        response.put("fineAmount", loan.getFineAmount());
        response.put("finePaidAt", loan.getFinePaidAt().toString());
        return ResponseEntity.ok(response);
    }

    // PUT /api/loans/{id}/waive-fine — waive fine (admin only)
    @PutMapping("/{loanId}/waive-fine")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> waiveFine(
            @PathVariable Long loanId,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null) ? body.get("reason") : null;
        Loan loan = loanService.waiveFine(loanId, reason);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Fine waived successfully.");
        response.put("fineWaivedAt", loan.getFineWaivedAt().toString());
        response.put("reason", loan.getFineWaivedReason());
        return ResponseEntity.ok(response);
    }
}