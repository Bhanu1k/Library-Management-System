# 04 — System Architecture
# Library Management System

---

## 1. Architecture Style

**Monolithic 3-Tier Architecture**
- Tier 1: Frontend (HTML/CSS/JS)
- Tier 2: Spring Boot REST API
- Tier 3: Microsoft SQL Server (SSMS)

Communication between tiers is via **HTTP REST (JSON)** with **JWT-based stateless authentication**.

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                          │
│              HTML5 | CSS3 | JavaScript (ES6+)               │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │  Pages   │  │  Styles  │  │  JS (Fetch API / AJAX)   │  │
│  │ .html    │  │  .css    │  │  auth.js | books.js       │  │
│  └──────────┘  └──────────┘  └──────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST / JSON
                           │ Authorization: Bearer <JWT>
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              SPRING BOOT APPLICATION (Port 8085)            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │             JWT Security Filter (Every Request)       │  │
│  └──────────────────────────┬────────────────────────────┘  │
│  ┌──────────────────────────▼────────────────────────────┐  │
│  │           REST Controllers (Routing Layer)            │  │
│  │  AuthController | BookController | MemberController   │  │
│  │  LoanController | DashboardController                 │  │
│  └──────────────────────────┬────────────────────────────┘  │
│  ┌──────────────────────────▼────────────────────────────┐  │
│  │           Service Layer (Business Logic)              │  │
│  │  AuthService | BookService | MemberService            │  │
│  │  LoanService | DashboardService                       │  │
│  └──────────────────────────┬────────────────────────────┘  │
│  ┌──────────────────────────▼────────────────────────────┐  │
│  │        Repository Layer (Spring Data JPA)             │  │
│  │  UserRepo | BookRepo | MemberRepo | LoanRepo          │  │
│  └──────────────────────────┬────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ JPA / Hibernate ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Microsoft SQL Server (SSMS)                    │
│         Port: 1433 | Database: library_db                   │
│   Tables: users | books | members | loans                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Component Responsibilities

### Frontend
| Component | Responsibility |
|-----------|---------------|
| HTML Pages | UI structure, forms, tables |
| CSS | Styling, layout, responsive design |
| auth.js | Login, logout, JWT storage |
| api.js | Fetch wrapper with auth headers |
| books.js | Book CRUD, search, table render |
| members.js | Member CRUD, search, table render |
| loans.js | Issue/return, fine display |
| dashboard.js | Stats fetch, card render |

### Backend
| Component | Responsibility |
|-----------|---------------|
| Controller | Route HTTP requests, return responses |
| Service | Business logic, validation, orchestration |
| Repository | Database queries via Spring Data JPA |
| Security | JWT filter, role authorization |
| DTO | Data transfer objects (request/response shapes) |
| Exception Handler | Global error responses |

---

## 4. Security Architecture

```
HTTP Request
     │
     ▼
JwtAuthFilter
     │── Extract token from Authorization header
     │── Validate signature + expiry
     │── Extract username + role
     │── Set SecurityContext
     │
     ▼
DispatcherServlet
     │
     ▼
@PreAuthorize("hasRole('ADMIN')")
     │── Role check passes → Controller executes
     └── Role check fails  → 403 Forbidden

Invalid/Missing Token → 401 Unauthorized
```

---

## 5. Spring Boot Project Structure

```
src/main/java/com/library/
├── LibraryApplication.java           ← Main entry point
│
├── controller/
│   ├── AuthController.java
│   ├── BookController.java
│   ├── MemberController.java
│   ├── LoanController.java
│   └── DashboardController.java
│
├── service/
│   ├── AuthService.java
│   ├── BookService.java
│   ├── MemberService.java
│   ├── LoanService.java
│   └── DashboardService.java
│
├── repository/
│   ├── UserRepository.java
│   ├── BookRepository.java
│   ├── MemberRepository.java
│   └── LoanRepository.java
│
├── model/
│   ├── User.java
│   ├── Book.java
│   ├── Member.java
│   └── Loan.java
│
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── BookRequest.java
│   │   ├── MemberRequest.java
│   │   └── LoanRequest.java
│   └── response/
│       ├── AuthResponse.java
│       ├── BookResponse.java
│       ├── MemberResponse.java
│       ├── LoanResponse.java
│       └── DashboardStats.java
│
├── security/
│   ├── JwtUtil.java
│   ├── JwtAuthFilter.java
│   ├── UserDetailsServiceImpl.java
│   └── SecurityConfig.java
│
└── exception/
    ├── GlobalExceptionHandler.java
    ├── ResourceNotFoundException.java
    ├── BookNotAvailableException.java
    └── DuplicateEntryException.java
```

---

## 6. Frontend Project Structure

```
frontend/
├── index.html             ← Login page
├── dashboard.html
├── books.html
├── members.html
├── loans.html
├── profile.html
│
├── css/
│   ├── style.css          ← Global styles
│   ├── dashboard.css
│   ├── books.css
│   ├── members.css
│   └── loans.css
│
└── js/
    ├── api.js             ← Base fetch wrapper
    ├── auth.js            ← Login/logout/JWT
    ├── dashboard.js
    ├── books.js
    ├── members.js
    └── loans.js
```

---

## 7. Port & CORS Configuration

| Service | Port |
|---------|------|
| Spring Boot API | 8085 |
| SQL Server | 1433 |
| Frontend (Live Server) | 5500 |

CORS configured in `SecurityConfig.java` to allow `http://localhost:5500`.

---

## 8. Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | HTML5, CSS3, JavaScript | ES6+ |
| Backend | Java + Spring Boot | 17 / 3.x |
| Database | Microsoft SQL Server | 2019+ |
| ORM | Spring Data JPA + Hibernate | Latest |
| Auth | Spring Security + JWT (jjwt) | 0.11.5 |
| Build | Maven | 3.x |
| IDE | IntelliJ IDEA / VS Code | Latest |
| DB GUI | SSMS (SQL Server Mgmt Studio) | Latest |
