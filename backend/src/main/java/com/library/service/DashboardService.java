package com.library.service;

import com.library.dto.DashboardStats;
import com.library.model.Loan;
import com.library.repository.BookRepository;
import com.library.repository.LoanRepository;
import com.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;

    public DashboardStats getStats() {
        long totalBooks = bookRepository.count();
        long totalMembers = memberRepository.count();
        long activeLoans = loanRepository.countActiveLoans();
        long overdueLoans = loanRepository.countOverdueLoans(LocalDate.now());

        // Recent loans (last 10)
        List<Loan> recent = loanRepository.findRecentLoans();
        List<Map<String, Object>> recentLoans = recent.stream()
                .limit(10)
                .map(loan -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", loan.getId());
                    map.put("bookTitle", loan.getBook().getTitle());
                    map.put("memberName", loan.getMember().getName());
                    map.put("issueDate", loan.getIssueDate().toString());
                    map.put("dueDate", loan.getDueDate().toString());
                    map.put("returnDate", loan.getReturnDate() != null ? loan.getReturnDate().toString() : null);
                    map.put("status", loan.getStatus().name());
                    return map;
                })
                .collect(Collectors.toList());

        return DashboardStats.builder()
                .totalBooks(totalBooks)
                .totalMembers(totalMembers)
                .activeLoans(activeLoans)
                .overdueLoans(overdueLoans)
                .recentLoans(recentLoans)
                .build();
    }
}
