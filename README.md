# Library Management System

A full-stack library management system built with Spring Boot (backend) and vanilla HTML/CSS/JS (frontend).

---

## Features

### Core Features
- **Book Management** — Add, update, delete, and search books with filters
- **Member Management** — Register members, track membership status, renewal
- **Loan Management** — Issue/return books, track due dates, calculate fines
- **Dashboard** — View statistics (total books, members, loans, overdue)
- **Reports** — Generate overdue reports with PDF export (iText 7)

### User Management
- **Role-based Access**: Admin, Librarian, Member
- **JWT Authentication** with secure password hashing (BCrypt)
- **Profile Management** — Update personal info, change password, upload avatar

### Notifications System
- **Automatic Schedulers**:
  - 8:00 AM daily — Due date reminders (books due within 7 days)
  - 9:00 AM daily — Fine alerts for overdue books
  - Hourly — Retry failed notifications
  - Sunday 2:00 AM — Cleanup old notifications (30+ days)
- **Delivery Methods**: In-App, Email (SMTP), SMS (Twilio)
- **User Preferences**: Customize notification types, delivery methods, quiet hours

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Spring Boot 3.2.5, Java 17 |
| Database | PostgreSQL |
| Authentication | JWT (io.jsonwebtoken) |
| Security | Spring Security, BCrypt |
| PDF Generation | iText 7 |
| Notifications | Spring Mail, Twilio SMS |
| Frontend | Vanilla HTML, CSS, JavaScript |

---

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

---

## Quick Start

### 1. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/library-management-system.git
cd library-management-system
```

### 2. Create Database

```bash
psql -U postgres -c "CREATE DATABASE librarydb;"
```

### 3. Configure Environment (Optional)

```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit .env with your settings (defaults work for local dev)
```

**Optional - for email notifications:**
```env
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=app_specific_password
```

**Optional - for SMS notifications:**
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Run Backend

```bash
cd backend
mvn clean spring-boot:run
```

The server starts on **port 8099**.

### 5. Run Frontend

Open `frontend/index.html` with **VS Code Live Server** (port 5500) or any static server.

### 6. Login

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| librarian | lib123 | LIBRARIAN |
| member | mem123 | MEMBER |

---

## Project Structure

```
library-management-system/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/com/library/
│   │   ├── config/            # Security, CORS, Web config
│   │   ├── controller/       # REST API endpoints
│   │   ├── dto/              # Data transfer objects
│   │   ├── exception/        # Global exception handler
│   │   ├── model/            # JPA entities
│   │   ├── repository/        # Data access layer
│   │   ├── security/         # JWT filter and utilities
│   │   └── service/          # Business logic
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── schema.sql
│   ├── .env.example
│   └── pom.xml
├── frontend/                   # Static frontend
│   ├── index.html            # Login page
│   ├── dashboard.html        # Dashboard
│   ├── books.html            # Book management
│   ├── members.html          # Member management
│   ├── loans.html            # Loan management
│   ├── users.html            # User management (Admin)
│   ├── profile.html          # User profile
│   ├── Notifications.html    # Notifications
│   ├── Reports.html          # Overdue reports
│   ├── Books_search.html     # Book search
│   ├── css/                  # Stylesheets
│   └── js/                   # JavaScript files
├── .gitignore
└── README.md
```

---

## API Reference

**Base URL**: `http://localhost:8099/api`

All protected endpoints require: `Authorization: Bearer <JWT_TOKEN>`

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Login → returns JWT |
| PUT | `/auth/change-password` | Any | Change own password |

### Books

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/books` | Any | List all books |
| GET | `/books/{id}` | Any | Get book by ID |
| GET | `/books/search` | Any | Search with filters |
| POST | `/books` | Admin/Librarian | Add book |
| PUT | `/books/{id}` | Admin/Librarian | Update book |
| DELETE | `/books/{id}` | Admin | Delete book |

### Members

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/members` | Admin/Librarian | List all |
| GET | `/members/{id}` | Admin/Librarian | Get by ID |
| POST | `/members` | Admin/Librarian | Add member |
| PUT | `/members/{id}` | Admin/Librarian | Update member |
| DELETE | `/members/{id}` | Admin/Librarian | Deactivate |
| PUT | `/members/{id}/renew` | Admin | Renew 1 year |

### Loans

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/loans?status=ACTIVE` | Any | Active/returned |
| GET | `/loans/overdue` | Any | Overdue loans |
| GET | `/loans/fines/unpaid` | Admin/Librarian | Unpaid fines |
| POST | `/loans/issue` | Admin/Librarian | Issue book |
| POST | `/loans/borrow/{bookId}` | Member | Self-borrow |
| PUT | `/loans/return/{loanId}` | Admin/Librarian | Return book |
| PUT | `/loans/{id}/pay-fine` | Admin/Librarian | Pay fine |

### Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Any | Get all |
| GET | `/notifications/unread` | Any | Unread only |
| GET | `/notifications/unread-count` | Any | Badge count |
| PUT | `/notifications/{id}/read` | Any | Mark read |
| PUT | `/notifications/read-all` | Any | Mark all read |
| GET | `/notifications/preferences` | Any | Get preferences |
| PUT | `/notifications/preferences` | Any | Update preferences |

### Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile/me` | Any | Get profile |
| PUT | `/profile/me` | Any | Update info |
| POST | `/profile/me/picture` | Any | Upload avatar |
| PUT | `/profile/me/password` | Any | Change password |

### Dashboard & Reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard/stats` | Admin/Librarian | Statistics |
| GET | `/reports/overdue` | Admin/Librarian | Overdue JSON |
| GET | `/reports/overdue/export/pdf` | Admin/Librarian | Download PDF |

---

## Fine Rules

- ₹5 per day overdue
- Maximum fine: ₹500
- Member cannot borrow if:
  - Inactive status
  - Expired membership
  - 3+ active loans
  - Any overdue book
  - Unpaid fine

---

## Screenshots

- **Login** — Clean login form with role selection
- **Dashboard** — Stats cards, quick actions, recent activity
- **Books** — Table with search, add/edit modal, category filter
- **Members** — Member list, membership status, expiry tracking
- **Loans** — Issue/return workflow, fine calculation
- **Notifications** — Bell icon with badge, notification list
- **Profile** — Avatar upload, notification preferences

---

## License

MIT License