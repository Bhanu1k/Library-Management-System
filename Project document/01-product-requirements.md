# 01 — Product Requirements
# Library Management System

**Version**: 1.0 | **Date**: March 2026 | **Status**: Active

---

## 1. Product Vision

To build a full-stack Library Management System that digitizes all library operations — book cataloging, member management, and loan tracking — replacing manual registers with a fast, secure, and easy-to-use web application.

---

## 2. Problem Statement

Libraries operating manually face:
- No real-time visibility into book availability
- Error-prone manual loan records
- No automated overdue fine calculation
- Slow member registration and lookup
- Risk of data loss

---

## 3. Product Goals

| Goal | Metric |
|------|--------|
| Digitize book catalog | 100% books searchable |
| Automate loan tracking | Zero manual entries |
| Auto-calculate fines | Fine computed on return |
| Central member records | Single source of truth |
| Real-time insights | Dashboard with live stats |

---

## 4. Users & Roles

| Role | Description | Access |
|------|-------------|--------|
| **ADMIN** | Library Manager | Full access |
| **LIBRARIAN** | Library Staff | Books, Members, Loans |
| **MEMBER** | Subscriber | Own loans & profile |

---

## 5. Core Functional Requirements

### Authentication
- Login with username + password
- JWT token issued on login (24hr expiry)
- Role-based route protection
- BCrypt password hashing
- Admin can create user accounts

### Book Management
- Add book (title, author, ISBN, category, copies)
- View all books with search & filter
- Edit and delete books
- Track available vs total copies

### Member Management
- Register member (name, email, phone, address)
- View, search, update, deactivate members
- View member loan history

### Loan Management
- Issue book to member (14-day default loan)
- Return book with fine calculation (₹5/day overdue)
- View active, overdue, and historical loans
- Prevent issue if no copies available

### Dashboard
- Total books, members, active loans, overdue count
- Recent activity feed

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | API response < 500ms |
| Security | JWT auth, BCrypt, HTTPS |
| Usability | Responsive UI, mobile-friendly |
| Scalability | Supports 10,000 books, 5,000 members |
| Compatibility | Chrome, Firefox, Edge (latest) |

---

## 7. Out of Scope (Phase 1)

- Online book reservation
- E-book / digital content
- Payment gateway
- Mobile app
- Multi-branch support

---

## 8. Priority Matrix

| Feature | Priority |
|---------|----------|
| Auth (Login/JWT) | Must Have |
| Book CRUD | Must Have |
| Member CRUD | Must Have |
| Loan Issue/Return | Must Have |
| Fine Calculation | Must Have |
| Dashboard Stats | Must Have |
| Book CSV Import | Nice to Have |
| Email Reminders | Nice to Have |
| Member ID Card | Nice to Have |
