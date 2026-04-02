# Library Management System Feature Availability Checklist

This document maps the requested LMS feature list against the features currently implemented in this codebase.

## Legend

- `Available`: implemented and visible in the current backend/frontend
- `Partial`: some support exists, but the full feature is not implemented
- `Missing`: not implemented in the current project

## Core Features

| Feature | Status | Notes |
|---|---|---|
| Add books | Available | Admin/Librarian can add books. |
| Update books | Available | Admin/Librarian can edit books. |
| Delete books | Available | Admin can delete books. |
| Search books by title/author/ISBN | Available | Search UI and backend search are present. |
| Filter books by genre/category | Available | Implemented as category filtering. |
| Track total and available copies | Available | Managed through book and loan logic. |
| Register new members | Available | Member creation exists. |
| View member profiles | Available | Member records can be viewed by Admin/Librarian. |
| Update member profiles | Available | Member edit flow exists. |
| Membership expiry | Missing | No expiry field or expiry workflow found. |
| Membership renewal | Missing | No renewal flow found. |
| Issue books to members | Available | Librarian/Admin can issue books. |
| Member self-borrow | Available | Member borrow endpoint and UI are present. |
| Return books | Available | Return flow updates book availability. |
| Track due dates | Available | Due dates are stored and shown in UI. |
| Auto-calculate overdue fines | Available | Fine is calculated on overdue return. |
| Fine payment tracking | Missing | Fine payment records are not implemented. |
| Fine waiver by admin | Missing | No waiver endpoint or UI exists. |

## Search and Discovery

| Feature | Status | Notes |
|---|---|---|
| Advanced search | Partial | Search exists, but not full multi-field advanced search. |
| Filter results | Available | Search/category filtering is present. |
| Sort results | Missing | No clear sorting UI or backend sort workflow found. |
| Book availability status | Available | Availability is shown in the books table. |

## User Roles

| Feature | Status | Notes |
|---|---|---|
| Admin role | Available | Fuller control over books, members, dashboard. |
| Librarian role | Available | Can issue/return and manage operational tasks. |
| Member/Student role | Available | Can browse books, borrow, and view loan history. |
| Role-based access control | Available | Enforced in Spring Security. |

## Reports and Analytics

| Feature | Status | Notes |
|---|---|---|
| Dashboard stats | Available | Basic counts and recent loans are implemented. |
| Books issued per day/month | Missing | No date-grouped reporting exists. |
| Most borrowed books | Missing | No aggregate borrow-frequency report exists. |
| Overdue books report | Partial | Overdue loans list exists, but not a dedicated report/export. |
| Member activity report | Missing | No formal member activity analytics report exists. |

## Notifications

| Feature | Status | Notes |
|---|---|---|
| Due date reminders | Missing | No scheduler/email/notification logic found. |
| Fine alerts | Missing | No alert workflow found. |
| New book arrival notifications | Missing | No email/SMS notification system found. |

## Authentication and Security

| Feature | Status | Notes |
|---|---|---|
| Login | Available | JWT login is implemented. |
| Logout | Available | Frontend logout exists. |
| Change password | Available | Authenticated password change is implemented. |
| Password reset | Missing | No forgot-password/reset-token flow found. |
| JWT auth | Available | Implemented in backend security stack. |

## Advanced Features

| Feature | Status | Notes |
|---|---|---|
| Reservation/Hold system | Missing | No reservation model, API, or UI exists. |
| Digital catalog / e-books | Missing | No digital resource support found. |
| Barcode/QR scanning | Missing | No scanning support found. |
| Multi-branch support | Missing | No branch/location model found. |
| Audit logs | Missing | No audit trail system found. |

## Summary

### Strongly Implemented

- Book management
- Member management
- Issue and return flows
- Due dates and overdue handling
- Fine calculation
- Role-based login and permissions

### Partially Implemented

- Advanced search
- Overdue reporting
- Basic analytics/dashboard

### Not Yet Implemented

- Membership expiry and renewal
- Fine payments and waivers
- Rich reports
- Notifications
- Password reset
- Reservations
- Digital resources
- Barcode/QR support
- Multi-branch support
- Audit logs
