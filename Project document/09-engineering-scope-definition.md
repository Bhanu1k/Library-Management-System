# 09 — Engineering Scope Definition
# Library Management System

---

## 1. In Scope — Phase 1 (MVP)

### Frontend (HTML/CSS/JS)
- [x] Login page with JWT auth
- [x] Dashboard with stats cards
- [x] Books page: list, search, add, edit, delete
- [x] Members page: list, search, register, edit, deactivate
- [x] Loans page: active loans, overdue loans, history, issue, return
- [x] Role-based UI (hide/show elements by role)
- [x] Toast notifications (success/error)
- [x] Responsive layout (desktop + tablet)
- [x] JWT stored in localStorage, sent in headers

### Backend (Spring Boot)
- [x] Spring Boot project setup (Maven, Java 17)
- [x] SQL Server (SSMS) integration via JPA
- [x] User entity + BCrypt password hashing
- [x] JWT generation and validation (jjwt)
- [x] Spring Security filter chain
- [x] Role-based endpoint protection (`@PreAuthorize`)
- [x] AuthController (login, register)
- [x] BookController (CRUD + search)
- [x] MemberController (CRUD)
- [x] LoanController (issue, return, list, overdue)
- [x] DashboardController (stats)
- [x] GlobalExceptionHandler
- [x] CORS configuration for frontend origin
- [x] DTOs for all request/response bodies

### Database (SQL Server)
- [x] `library_db` database creation
- [x] `users`, `books`, `members`, `loans` tables
- [x] Constraints, indexes, foreign keys
- [x] Seed data (admin user, sample books, members)

---

## 2. Out of Scope — Phase 1

| Feature | Reason Deferred |
|---------|----------------|
| Book reservation / hold system | Phase 2 |
| Email notifications (due date reminders) | Phase 2 |
| CSV import/export for books | Phase 2 |
| Member ID card generation (PDF) | Phase 2 |
| Payment gateway for fines | Phase 2 |
| Mobile app (Android/iOS) | Phase 3 |
| Multi-branch library | Phase 3 |
| Google Books API integration | Phase 3 |
| E-book / digital content | Phase 3 |
| Analytics reports (charts) | Phase 2 |
| Audit logs | Phase 2 |

---

## 3. Technical Boundaries

### What We Build
- REST API backend (Spring Boot)
- Static frontend (HTML/CSS/JS — no framework)
- SQL Server relational database
- JWT authentication

### What We DON'T Build
- No frontend framework (React/Vue/Angular) — plain JS only
- No microservices — monolithic Spring Boot only
- No cloud deployment — local dev only for MVP
- No caching layer (Redis) — direct DB queries
- No message queue (Kafka/RabbitMQ)
- No Docker/Kubernetes — manual setup

---

## 4. Engineering Constraints

| Constraint | Detail |
|------------|--------|
| Language | Java 17 (backend), JavaScript ES6+ (frontend) |
| Framework | Spring Boot 3.x only |
| Database | Microsoft SQL Server 2019+ |
| Auth | JWT (no OAuth2 / SSO in Phase 1) |
| Build Tool | Maven (not Gradle) |
| Frontend | Plain HTML/CSS/JS — no bundler |
| API Style | REST/JSON only (no GraphQL) |
| Port | Backend: 8085, Frontend: 5500 |

---

## 5. Dependencies & Libraries

### Backend (pom.xml)
| Dependency | Purpose |
|------------|---------|
| spring-boot-starter-web | REST API |
| spring-boot-starter-data-jpa | ORM / DB access |
| spring-boot-starter-security | Auth framework |
| spring-boot-starter-validation | Input validation |
| mssql-jdbc | SQL Server driver |
| jjwt-api, jjwt-impl, jjwt-jackson | JWT generation/parsing |
| lombok | Boilerplate reduction |

### Frontend (CDN links only)
| Library | Purpose |
|---------|---------|
| Google Fonts | Typography |
| FontAwesome (optional) | Icons |
| No JS frameworks | Plain vanilla JS |

---

## 6. API Versioning

For Phase 1, all APIs are unversioned:
- `/api/books`, `/api/members`, `/api/loans`

Phase 2 will introduce versioning:
- `/api/v2/books`

---

## 7. Team & Responsibilities

| Area | Owner |
|------|-------|
| Backend API + Security | Backend Developer |
| Frontend UI + JS | Frontend Developer |
| Database Schema + Queries | Full Stack / DBA |
| Documentation | All |
| Testing | All |

*(For solo development: one developer handles all areas)*
