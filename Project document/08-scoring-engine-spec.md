# 08 — Scoring Engine Spec
# Library Management System — Fine & Scoring Rules

---

## 1. Overview

The Scoring Engine defines all business rules related to:
- Overdue fine calculation
- Member standing score (good standing vs restricted)
- Book availability scoring
- Dashboard metric computation

---

## 2. Fine Calculation Engine

### 2.1 Rule: Overdue Fine

| Parameter | Value |
|-----------|-------|
| Default Loan Period | 14 days |
| Fine Rate | ₹5 per day (after due date) |
| Grace Period | 0 days (fine starts day 1 after due date) |
| Max Fine Cap | ₹500 per loan |

**Formula:**
```
days_late   = return_date - due_date   (if > 0)
fine_amount = MIN(days_late × 5, 500)
```

**Java Implementation:**
```java
public BigDecimal calculateFine(LocalDate dueDate, LocalDate returnDate) {
    if (returnDate == null || !returnDate.isAfter(dueDate)) {
        return BigDecimal.ZERO;
    }
    long daysLate = ChronoUnit.DAYS.between(dueDate, returnDate);
    BigDecimal fine = BigDecimal.valueOf(daysLate).multiply(BigDecimal.valueOf(5));
    BigDecimal maxFine = BigDecimal.valueOf(500);
    return fine.compareTo(maxFine) > 0 ? maxFine : fine;
}
```

**SQL Equivalent (for reporting):**
```sql
SELECT
    id,
    due_date,
    return_date,
    CASE
        WHEN return_date > due_date
        THEN LEAST(DATEDIFF(DAY, due_date, return_date) * 5, 500)
        ELSE 0
    END AS fine_amount
FROM loans;
```

---

### 2.2 Rule: Overdue Status Auto-Update

Loans are marked `OVERDUE` when:
```
status = 'ACTIVE' AND due_date < CURRENT_DATE
```

This is computed dynamically in queries — no scheduled job needed for MVP.

For production, a scheduled task (`@Scheduled`) can update statuses nightly:
```java
@Scheduled(cron = "0 0 0 * * *")   // Runs at midnight
public void updateOverdueLoans() {
    loanRepository.markOverdueLoans(LocalDate.now());
}
```

---

## 3. Member Standing Score

Each member has a computed standing that determines loan eligibility.

### 3.1 Standing Rules

| Condition | Standing | Can Borrow? |
|-----------|----------|-------------|
| No active loans, no overdue | GOOD | ✅ Yes |
| Has active loans, none overdue | GOOD | ✅ Yes (up to limit) |
| Has 1+ overdue loan | RESTRICTED | ❌ No |
| Status = INACTIVE | SUSPENDED | ❌ No |

### 3.2 Max Concurrent Loans

| Role / Type | Max Loans |
|-------------|-----------|
| Regular Member | 3 books |
| Premium Member (future) | 5 books |

### 3.3 Implementation

```java
public MemberStanding getMemberStanding(Long memberId) {
    Member member = memberRepo.findById(memberId).orElseThrow();

    if (member.getStatus() == MemberStatus.INACTIVE) {
        return MemberStanding.SUSPENDED;
    }

    boolean hasOverdue = loanRepo.existsByMemberIdAndStatusAndDueDateBefore(
        memberId, LoanStatus.ACTIVE, LocalDate.now()
    );

    if (hasOverdue) return MemberStanding.RESTRICTED;

    int activeLoans = loanRepo.countByMemberIdAndStatus(memberId, LoanStatus.ACTIVE);
    if (activeLoans >= 3) return MemberStanding.RESTRICTED;

    return MemberStanding.GOOD;
}
```

---

## 4. Book Availability Score

Determines whether a book can be issued.

### 4.1 Rules

| Condition | Available? |
|-----------|-----------|
| `available_copies > 0` | ✅ Yes |
| `available_copies = 0` | ❌ No |

### 4.2 Copy Tracking

| Event | available_copies |
|-------|-----------------|
| Book Added | = total_copies |
| Book Issued | available_copies - 1 |
| Book Returned | available_copies + 1 |
| Book Deleted | Only if available = total (no active loans) |

---

## 5. Dashboard Metrics Computation

| Metric | Query |
|--------|-------|
| Total Books | `SELECT COUNT(*) FROM books` |
| Total Members | `SELECT COUNT(*) FROM members WHERE status = 'ACTIVE'` |
| Active Loans | `SELECT COUNT(*) FROM loans WHERE status = 'ACTIVE'` |
| Overdue Loans | `SELECT COUNT(*) FROM loans WHERE status = 'ACTIVE' AND due_date < GETDATE()` |
| Total Fines Collected | `SELECT SUM(fine_amount) FROM loans WHERE status = 'RETURNED'` |

---

## 6. Validation Rules (Pre-Issue Checks)

Before issuing a book, the system validates:

```
1. Book exists                         → 404 if not
2. available_copies > 0                → 400 "No copies available"
3. Member exists                       → 404 if not
4. Member status = ACTIVE              → 400 "Member is inactive"
5. Member has no overdue loans         → 400 "Member has overdue loans"
6. Member active loans < 3            → 400 "Member has reached loan limit"
```

All these checks run in `LoanService.issueBook()` before persisting.
