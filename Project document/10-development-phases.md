# 10 — Development Phases
# Library Management System

---

## Overview

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| Phase 1 | Project Setup + Database | Week 1 | 🔲 Pending |
| Phase 2 | Authentication (JWT) | Week 1 | 🔲 Pending |
| Phase 3 | Book Management | Week 2 | 🔲 Pending |
| Phase 4 | Member Management | Week 2 | 🔲 Pending |
| Phase 5 | Loan Management | Week 3 | 🔲 Pending |
| Phase 6 | Dashboard + Frontend Polish | Week 4 | 🔲 Pending |
| Phase 7 | Testing + Bug Fixes | Week 5 | 🔲 Pending |

---

## Phase 1 — Project Setup & Database
**Duration**: Days 1–3

### Backend Tasks
- [ ] Create Spring Boot project (Spring Initializr)
  - Dependencies: Web, JPA, Security, Validation, Lombok
- [ ] Add SQL Server (mssql-jdbc) dependency to `pom.xml`
- [ ] Add jjwt dependencies
- [ ] Configure `application.properties` for SSMS connection
- [ ] Create package structure (controller, service, repository, model, dto, security, exception)
- [ ] Test DB connection (run app, check logs)

### Database Tasks
- [ ] Create `library_db` database in SSMS
- [ ] Create all 4 tables: `users`, `books`, `members`, `loans`
- [ ] Add indexes and constraints
- [ ] Insert seed data (admin user, sample books, members)
- [ ] Verify schema in SSMS Table Designer

### Frontend Tasks
- [ ] Create `frontend/` folder structure
- [ ] Create base `index.html` (login page shell)
- [ ] Create `css/style.css` with CSS variables and reset
- [ ] Create `js/api.js` base fetch wrapper

**Deliverable**: App starts, connects to SSMS, tables visible in SSMS ✅

---

## Phase 2 — Authentication (JWT)
**Duration**: Days 4–6

### Backend Tasks
- [ ] Create `User.java` entity
- [ ] Create `UserRepository.java`
- [ ] Create `JwtUtil.java` — generate & validate tokens
- [ ] Create `JwtAuthFilter.java` — intercept & validate requests
- [ ] Create `UserDetailsServiceImpl.java`
- [ ] Create `SecurityConfig.java` — configure filter chain, CORS, public routes
- [ ] Create `AuthController.java` — POST `/api/auth/login`, POST `/api/auth/register`
- [ ] Create `AuthService.java`
- [ ] Create `LoginRequest.java`, `AuthResponse.java` DTOs
- [ ] Test login with Postman — get JWT token
- [ ] Test protected endpoint returns 401 without token

### Frontend Tasks
- [ ] Build `index.html` login form (username, password, button)
- [ ] Write `auth.js`:
  - `login()` — POST to `/api/auth/login`
  - Store token + role in `localStorage`
  - Redirect to `dashboard.html` on success
  - Show error on failure
  - `logout()` — clear localStorage, redirect to login
- [ ] Add auth guard to all pages (redirect to login if no token)

**Deliverable**: Login works, JWT stored, pages protected ✅

---

## Phase 3 — Book Management
**Duration**: Days 7–9

### Backend Tasks
- [ ] Create `Book.java` entity
- [ ] Create `BookRepository.java` with custom search query
- [ ] Create `BookService.java`:
  - `getAllBooks()`
  - `getBookById()`
  - `searchBooks(query)`
  - `addBook()`
  - `updateBook()`
  - `deleteBook()` (check no active loans)
- [ ] Create `BookController.java` — all CRUD endpoints
- [ ] Create `BookRequest.java`, `BookResponse.java` DTOs
- [ ] Validate request fields (`@NotBlank`, `@Min`, etc.)
- [ ] Test all endpoints in Postman

### Frontend Tasks
- [ ] Build `books.html` — table layout + search bar + Add button
- [ ] Write `books.js`:
  - `loadBooks()` — GET all books, render table
  - `searchBooks(query)` — filter results
  - `openAddModal()` — show add book form
  - `addBook()` — POST, reload table
  - `editBook(id)` — populate form, PUT, reload
  - `deleteBook(id)` — confirm dialog, DELETE, reload
- [ ] Show available/total copies in table
- [ ] Role-based: hide Add/Edit/Delete for MEMBER

**Deliverable**: Full book CRUD working end-to-end ✅

---

## Phase 4 — Member Management
**Duration**: Days 10–12

### Backend Tasks
- [ ] Create `Member.java` entity
- [ ] Create `MemberRepository.java`
- [ ] Create `MemberService.java` — CRUD operations
- [ ] Create `MemberController.java`
- [ ] Create `MemberRequest.java`, `MemberResponse.java` DTOs
- [ ] Test all endpoints in Postman

### Frontend Tasks
- [ ] Build `members.html` — table layout
- [ ] Write `members.js`:
  - `loadMembers()` — render table
  - `searchMembers()` — filter
  - `registerMember()` — POST
  - `editMember(id)` — PUT
  - `deactivateMember(id)` — DELETE/PATCH
  - `viewLoans(memberId)` — show member loan history

**Deliverable**: Full member CRUD working end-to-end ✅

---

## Phase 5 — Loan Management
**Duration**: Days 13–17

### Backend Tasks
- [ ] Create `Loan.java` entity
- [ ] Create `LoanRepository.java` — custom queries for active/overdue
- [ ] Create `LoanService.java`:
  - `issueBook()` — with all pre-checks + copy decrement
  - `returnBook()` — fine calculation + copy increment
  - `getActiveLoans()`
  - `getOverdueLoans()`
  - `getLoanHistory()`
  - `getLoansByMember(memberId)`
- [ ] Create `LoanController.java`
- [ ] Create `LoanRequest.java`, `LoanResponse.java` DTOs
- [ ] Test issue + return flow in Postman
- [ ] Test fine calculation

### Frontend Tasks
- [ ] Build `loans.html` — tabs: Active / Overdue / History
- [ ] Write `loans.js`:
  - `loadActiveLoans()` — render table
  - `loadOverdueLoans()` — highlight in red
  - `openIssueModal()` — member + book dropdowns
  - `issueBook()` — POST
  - `returnBook(loanId)` — PUT, show fine popup

**Deliverable**: Issue and return fully working, fines calculated ✅

---

## Phase 6 — Dashboard & Polish
**Duration**: Days 18–21

### Backend Tasks
- [ ] Create `DashboardController.java` — GET `/api/dashboard/stats`
- [ ] Create `DashboardService.java` — aggregate stats queries
- [ ] Create `DashboardStats.java` response DTO

### Frontend Tasks
- [ ] Build `dashboard.html` — 4 stat cards + recent activity table
- [ ] Write `dashboard.js` — fetch stats, render cards
- [ ] Build `profile.html` — view own account, change password
- [ ] Add navbar to all pages
- [ ] Add toast notifications (success / error) to all operations
- [ ] Mobile responsive CSS
- [ ] Loading spinner on fetch calls
- [ ] Final CSS polish on all pages

**Deliverable**: Complete working application, polished UI ✅

---

## Phase 7 — Testing & Bug Fixes
**Duration**: Days 22–25

### Testing Tasks
- [ ] Unit tests: `BookServiceTest`, `LoanServiceTest`
- [ ] Integration test: `BookControllerTest`
- [ ] Manual end-to-end test of all user flows
- [ ] Test all role-based restrictions
- [ ] Test edge cases (return overdue book, delete book with loans, etc.)
- [ ] Fix all identified bugs
- [ ] Code review + cleanup

**Deliverable**: Stable, tested, production-ready MVP ✅
