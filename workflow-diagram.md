# Workflow Diagram
# Library Management System

## Main Application Workflow

```mermaid
flowchart TD
    A[User Opens Frontend] --> B[Login Screen]
    B --> C[POST /api/auth/login]
    C --> D{Valid Credentials?}
    D -->|No| E[Show Login Error]
    D -->|Yes| F[Return JWT + Role]
    F --> G[Store Token in Frontend]
    G --> H[Load Dashboard / Module Pages]

    H --> I{Choose Feature}

    I --> J[Books Module]
    I --> K[Members Module]
    I --> L[Loans Module]
    I --> M[Notifications Module]
    I --> N[Profile Module]
    I --> O[Users Module]
    I --> P[Reports Module]

    J --> J1[GET /api/books or /api/books/search]
    J1 --> J2[BookController]
    J2 --> J3[BookRepository]
    J3 --> J4[(books)]

    J --> J5[POST/PUT/DELETE /api/books]
    J5 --> J2

    K --> K1[GET/POST/PUT /api/members]
    K1 --> K2[MemberController]
    K2 --> K3[MemberService]
    K3 --> K4[MemberRepository]
    K4 --> K5[(members)]

    K --> K6[Renew or Deactivate Member]
    K6 --> K2

    L --> L1[Issue / Borrow Book]
    L1 --> L2[LoanController]
    L2 --> L3[LoanService]
    L3 --> L4{Eligibility Checks}
    L4 -->|Fail| L5[Reject Request]
    L4 -->|Pass| L6[Create Loan]
    L6 --> L7[Update Book Availability]
    L7 --> L8[(loans)]
    L7 --> J4
    L6 --> L9[Create Notification if Needed]
    L9 --> M3

    L --> L10[Return Book / Pay Fine / Waive Fine]
    L10 --> L2
    L2 --> L3
    L3 --> L11[Update Loan Status and Fine State]
    L11 --> L8

    M --> M1[GET /api/notifications]
    M --> M2[PUT read / read-all / preferences]
    M1 --> M3[NotificationController]
    M2 --> M3
    M3 --> M4[NotificationService]
    M4 --> M5[NotificationRepository]
    M5 --> M6[(notifications)]
    M4 --> M7[NotificationPreferenceRepository]
    M7 --> M8[(notification_preferences)]

    N --> N1[GET/PUT /api/profile/me]
    N --> N2[Upload/Delete Picture]
    N --> N3[Change Password]
    N1 --> N4[ProfileController]
    N2 --> N4
    N3 --> N4
    N4 --> N5[ProfileService]
    N5 --> N6[UserRepository]
    N6 --> N7[(users)]

    O --> O1[Admin Manages Users]
    O1 --> O2[UserController]
    O2 --> N6
    O2 --> N7

    P --> P1[GET /api/reports/overdue]
    P --> P2[GET /api/reports/overdue/export/pdf]
    P1 --> P3[OverdueReportController]
    P2 --> P3
    P3 --> P4[OverdueReportService]
    P4 --> L8
    P4 --> K5
    P4 --> J4
```

## Background Scheduler Workflow

```mermaid
flowchart TD
    S1[Spring Boot Starts] --> S2[Enable Scheduling]
    S2 --> S3[NotificationScheduler Runs on Cron]

    S3 --> S4[8 AM: Due Date Reminder Job]
    S3 --> S5[9 AM: Fine Alert Job]
    S3 --> S6[Hourly: Retry Failed Notifications]
    S3 --> S7[Sunday 2 AM: Cleanup Old Notifications]

    S4 --> S8[Find Due / Soon-Due Loans]
    S5 --> S9[Find Overdue Loans]
    S8 --> S10[Load User Preferences]
    S9 --> S10
    S10 --> S11[Create In-App / Email / SMS Notifications]
    S11 --> S12[(notifications)]
    S11 --> S13[EmailService / SmsService]

    S6 --> S14[Retry Failed Sends]
    S14 --> S13

    S7 --> S15[Delete Old Notification Records]
    S15 --> S12
```

## Key Business Rules in Workflow

- Login returns a JWT, and protected APIs require `Authorization: Bearer <token>`.
- Loan creation checks member status, membership expiry, overdue books, unpaid fines, active loan count, and book availability.
- Returning a book updates loan state and may calculate or settle fines.
- Notification preferences control how reminders and alerts are sent.
- Admin-only flows include user role/status changes and fine waivers.
