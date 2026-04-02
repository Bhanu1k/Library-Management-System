package com.library.repository;

import com.library.model.Loan;
import com.library.model.Loan.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    @Query("SELECT l FROM Loan l JOIN FETCH l.book JOIN FETCH l.member WHERE l.status = :status")
    List<Loan> findByStatus(@Param("status") LoanStatus status);

    @Query("SELECT l FROM Loan l JOIN FETCH l.book JOIN FETCH l.member WHERE l.member.id = :memberId")
    List<Loan> findByMemberId(@Param("memberId") Long memberId);

    List<Loan> findByMemberIdAndStatus(Long memberId, LoanStatus status);

    @Query("SELECT l FROM Loan l JOIN FETCH l.book JOIN FETCH l.member WHERE l.book.id = :bookId")
    List<Loan> findByBookId(@Param("bookId") Long bookId);

    @Query("SELECT l FROM Loan l JOIN FETCH l.book JOIN FETCH l.member WHERE l.status = 'ACTIVE' AND l.dueDate < :today")
    List<Loan> findOverdueLoans(@Param("today") LocalDate today);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.member.id = :memberId AND l.status = 'ACTIVE'")
    long countActiveLoansByMember(@Param("memberId") Long memberId);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.member.id = :memberId AND l.status = 'ACTIVE' AND l.dueDate < :today")
    long countOverdueLoansByMember(@Param("memberId") Long memberId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'ACTIVE'")
    long countActiveLoans();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :today")
    long countOverdueLoans(@Param("today") LocalDate today);

    // Loans with fines that are not paid and not waived
    @Query("SELECT l FROM Loan l JOIN FETCH l.book JOIN FETCH l.member WHERE l.fineAmount > 0 AND l.finePaid = false AND l.fineWaived = false")
    List<Loan> findLoansWithUnpaidFines();

    @Query("SELECT l FROM Loan l JOIN FETCH l.book JOIN FETCH l.member ORDER BY l.issueDate DESC")
    List<Loan> findRecentLoans();

    @Query("SELECT l FROM Loan l JOIN FETCH l.book JOIN FETCH l.member WHERE l.id = :id")
    Optional<Loan> findById(@Param("id") Long id);

    @Query("SELECT l FROM Loan l JOIN FETCH l.book JOIN FETCH l.member WHERE l.status = 'ACTIVE' AND l.dueDate BETWEEN :from AND :to")
    List<Loan> findActiveLoansDueBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}