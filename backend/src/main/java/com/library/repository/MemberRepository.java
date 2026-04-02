package com.library.repository;

import com.library.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Member> findByStatus(String status);
    List<Member> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    // Members whose expiry has passed but are still marked ACTIVE
    @Query("SELECT m FROM Member m WHERE m.status = 'ACTIVE' AND m.expiryDate < :today")
    List<Member> findExpiredActiveMembers(@Param("today") LocalDate today);

    // Members expiring within a date range (for warnings)
    @Query("SELECT m FROM Member m WHERE m.expiryDate BETWEEN :from AND :to AND m.status = 'ACTIVE'")
    List<Member> findExpiringBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}