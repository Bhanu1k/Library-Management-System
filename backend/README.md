# Library Management System — Backend

Spring Boot 3.2.5 · Java 17 · PostgreSQL · JWT · iText 7

---

## What Was Fixed

### Compile Errors (3 errors → 0)

| Error | Root Cause | Fix |
|---|---|---|
| `UserBuilder.memberId(long)` not found | `User.java` had both `@Getter @Setter` (Lombok) AND manually declared `getMemberId()`/`setMemberId()`. This caused Lombok's annotation processor to fail generating the builder method. | Removed the duplicate manual getter/setter from `User.java` |
| `user.getMemberId()` not found (LoanService line 86, 90) | Cascade of the same Lombok conflict above | Fixed by the `User.java` fix above |
| `DataSeeder` calling `.memberId(1L)` on builder | Builder method was absent (above bug) + hardcoded `1L` is wrong for auto-generated IDs | Rewritten to save members first, capture returned IDs, then set via `setMemberId()` |

### Additional Improvements

- **`BookController.java`** — Added (was missing). Frontend `books.js` calls `GET/POST/PUT/DELETE /api/books` — these endpoints were absent from the original backend.
- **`UserController.java`** — Added (was missing). Frontend `users.js` calls `GET /api/users`, `PUT /api/users/{id}/role`, `PUT /api/users/{id}/status` — these didn't exist.
- **`SecurityConfig.java`** — Added `@EnableMethodSecurity` (required for `@PreAuthorize` to work) + `/api/users/**` route rules.
- **`schema.sql`** — Extended to handle `loans` and `members` column upgrades, not just `users`.
- **`application.properties`** — Added `spring.task.scheduling.pool.size=5` (required for `@Scheduled` in `NotificationScheduler`); added `localhost:3000` to default CORS origins.
- **`LoanService.java`** — Added null-safety on `fineAmount.compareTo()` + membership expiry check before issuing books.
- **`.env.example`** — Created with all environment variable documentation.

---

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

---

## Quick Start

### 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE librarydb;"
```

### 2. Configure (optional for local dev)

Copy `.env.example` to `.env` — defaults work for local development without any changes.

If you want email notifications, fill in `MAIL_USERNAME` and `MAIL_PASSWORD`.

### 3. Run

```bash
cd backend
mvn clean spring-boot:run
```

The server starts on **port 8099**.

On first run, the database is auto-seeded with:

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `librarian` | `lib123` | LIBRARIAN |
| `member` | `mem123` | MEMBER |
| `priya` | `priya123` | MEMBER |

### 4. Run the frontend

Open `frontend-fixed/index.html` with **VS Code Live Server** (port 5500) or any static server.

---

## API Reference

Base URL: `http://localhost:8099/api`

All protected endpoints require: `Authorization: Bearer <JWT_TOKEN>`

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login → returns JWT |
| PUT | `/auth/change-password` | Any | Change own password |

**Login request:**
```json
{ "username": "admin", "password": "admin123" }
```
**Login response:**
```json
{ "token": "eyJ...", "username": "admin", "role": "ADMIN" }
```

---

### Books — `/api/books`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/books` | Any | List all books |
| GET | `/books/{id}` | Any | Get book by ID |
| GET | `/books/search` | Any | Search with filters + pagination |
| POST | `/books` | Admin/Librarian | Add book |
| PUT | `/books/{id}` | Admin/Librarian | Update book |
| DELETE | `/books/{id}` | Admin | Delete book |

**Search params:** `query`, `title`, `author`, `isbn`, `category`, `yearFrom`, `yearTo`, `availableOnly`, `page`, `size`, `sortBy`, `sortDir`

---

### Members — `/api/members`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/members` | Admin/Librarian | List all |
| GET | `/members/{id}` | Admin/Librarian | Get by ID |
| POST | `/members` | Admin/Librarian | Add member |
| PUT | `/members/{id}` | Admin/Librarian | Update member |
| DELETE | `/members/{id}` | Admin/Librarian | Deactivate |
| PUT | `/members/{id}/renew` | Admin | Renew membership 1 year |
| GET | `/members/expiring?days=30` | Admin/Librarian | Expiring soon |

---

### Loans — `/api/loans`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/loans?status=ACTIVE` | Any | Active/returned loans |
| GET | `/loans/overdue` | Any | Overdue loans |
| GET | `/loans/fines/unpaid` | Admin/Librarian | Unpaid fines |
| GET | `/loans/member/{memberId}` | Any | Member's loans |
| POST | `/loans/issue` | Admin/Librarian | Issue book to member |
| POST | `/loans/borrow/{bookId}` | Any auth | Self-borrow (member) |
| PUT | `/loans/return/{loanId}` | Admin/Librarian | Return book |
| PUT | `/loans/{id}/pay-fine` | Admin/Librarian | Mark fine paid |
| PUT | `/loans/{id}/waive-fine` | Admin | Waive fine |

---

### Dashboard — `/api/dashboard`

| Method | Path | Auth |
|---|---|---|
| GET | `/dashboard/stats` | Admin/Librarian |

---

### Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Any | Get user's notifications |
| GET | `/notifications/unread` | Any | Unread only |
| GET | `/notifications/unread-count` | Any | Count badge |
| PUT | `/notifications/{id}/read` | Any | Mark one read |
| PUT | `/notifications/read-all` | Any | Mark all read |
| GET | `/notifications/preferences` | Any | Get preferences |
| PUT | `/notifications/preferences` | Any | Update preferences |

---

### Profile — `/api/profile`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/profile/me` | Any | Get own profile |
| PUT | `/profile/me` | Any | Update name/email/phone |
| POST | `/profile/me/picture` | Any | Upload profile picture |
| DELETE | `/profile/me/picture` | Any | Remove picture |
| PUT | `/profile/me/password` | Any | Change password |

---

### Users (Admin) — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users |
| GET | `/users/{id}` | Admin/Librarian | Get user |
| PUT | `/users/{id}/role` | Admin | Change role |
| PUT | `/users/{id}/status` | Admin | Activate/deactivate |

---

### Reports — `/api/reports`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/reports/overdue` | Admin/Librarian | Overdue loans JSON |
| GET | `/reports/overdue/export/pdf` | Admin/Librarian | Download PDF report |

---

## Project Structure

```
backend/
├── pom.xml
├── .env.example
└── src/
    └── main/
        ├── java/com/library/
        │   ├── LibraryApplication.java     (@SpringBootApplication + @EnableScheduling)
        │   ├── config/
        │   │   ├── CorsConfig.java          (CORS filter)
        │   │   ├── DataSeeder.java          (seeds DB on first run) ← FIXED
        │   │   ├── SecurityConfig.java      (JWT + route rules)     ← UPDATED
        │   │   └── WebConfig.java           (serves /uploads/**)
        │   ├── controller/
        │   │   ├── AuthController.java
        │   │   ├── BookController.java       ← NEW
        │   │   ├── BookSearchController.java
        │   │   ├── DashboardController.java
        │   │   ├── LoanController.java
        │   │   ├── MemberController.java
        │   │   ├── NotificationController.java
        │   │   ├── OverdueReportController.java
        │   │   ├── ProfileController.java
        │   │   └── UserController.java       ← NEW
        │   ├── dto/
        │   │   ├── ChangePasswordRequest.java
        │   │   ├── DashboardStats.java
        │   │   ├── IssueLoanRequest.java
        │   │   ├── LoginRequest.java
        │   │   └── LoginResponse.java
        │   ├── exception/
        │   │   └── GlobalExceptionHandler.java
        │   ├── model/
        │   │   ├── Book.java
        │   │   ├── Loan.java
        │   │   ├── Member.java
        │   │   ├── Notification.java
        │   │   ├── NotificationPreference.java
        │   │   └── User.java                 ← FIXED (Lombok conflict)
        │   ├── repository/
        │   │   ├── BookRepository.java
        │   │   ├── LoanRepository.java
        │   │   ├── MemberRepository.java
        │   │   ├── NotificationPreferenceRepository.java
        │   │   ├── NotificationRepository.java
        │   │   └── UserRepository.java
        │   ├── security/
        │   │   ├── JwtAuthFilter.java
        │   │   └── JwtUtil.java
        │   └── service/
        │       ├── AuthService.java
        │       ├── BookSearchService.java
        │       ├── DashboardService.java
        │       ├── EmailService.java
        │       ├── LoanService.java          ← FIXED (null safety + expiry check)
        │       ├── MemberService.java
        │       ├── NotificationScheduler.java
        │       ├── NotificationService.java
        │       ├── OverdueReportService.java
        │       ├── ProfileService.java
        │       └── SmsService.java
        └── resources/
            ├── application.properties        ← UPDATED
            └── schema.sql                    ← EXTENDED
```

---

## Fine Rules

- ₹5 per day overdue
- Maximum fine: ₹500
- Member cannot borrow if: inactive, expired membership, 3+ active loans, any overdue book, or unpaid fine

## Notification Scheduler

Runs automatically (no configuration needed):
- **8:00 AM daily** — due date reminders (books due within 7 days)
- **9:00 AM daily** — fine alerts (overdue books)
- **Every hour** — retry failed notifications
- **Sunday 2:00 AM** — cleanup notifications older than 30 days
