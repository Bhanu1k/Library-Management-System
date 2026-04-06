# 05 - Database Schema
# Library Management System - Current PostgreSQL Schema

---

## 1. Overview

This document reflects the current backend data model implemented in:

- `backend/src/main/java/com/library/model`
- `backend/src/main/resources/schema.sql`
- `backend/src/main/resources/application.properties`

The application currently uses PostgreSQL with Hibernate auto-update enabled:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/librarydb
spring.jpa.hibernate.ddl-auto=update
spring.sql.init.mode=always
```

---

## 2. Entity Relationship Diagram

```mermaid
erDiagram
    BOOKS {
        BIGINT id PK
        VARCHAR title
        VARCHAR author
        VARCHAR isbn UK
        VARCHAR category
        INTEGER published_year
        INTEGER total_copies
        INTEGER available_copies
        VARCHAR description
    }

    MEMBERS {
        BIGINT id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR phone
        VARCHAR address
        DATE joined_date
        DATE expiry_date
        VARCHAR status
    }

    LOANS {
        BIGINT id PK
        BIGINT book_id FK
        BIGINT member_id FK
        DATE issue_date
        DATE due_date
        DATE return_date
        DECIMAL fine_amount
        BOOLEAN fine_paid
        TIMESTAMP fine_paid_at
        BOOLEAN fine_waived
        TIMESTAMP fine_waived_at
        VARCHAR fine_waived_reason
        VARCHAR status
    }

    USERS {
        BIGINT id PK
        VARCHAR username UK
        VARCHAR password
        VARCHAR email UK
        VARCHAR full_name
        VARCHAR phone
        VARCHAR role
        VARCHAR profile_picture
        BOOLEAN active
        BIGINT member_id
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    NOTIFICATIONS {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR type
        VARCHAR title
        TEXT message
        VARCHAR delivery_method
        VARCHAR status
        BIGINT reference_id
        VARCHAR reference_type
        TIMESTAMP scheduled_at
        TIMESTAMP sent_at
        TIMESTAMP read_at
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    NOTIFICATION_PREFERENCES {
        BIGINT id PK
        BIGINT user_id FK UK
        BOOLEAN due_date_reminder_enabled
        INTEGER due_date_reminder_days_before
        BOOLEAN fine_alert_enabled
        BOOLEAN new_book_arrival_enabled
        VARCHAR preferred_categories
        BOOLEAN delivery_method_in_app
        BOOLEAN delivery_method_email
        BOOLEAN delivery_method_sms
        VARCHAR notification_frequency
        TIME quiet_hours_start
        TIME quiet_hours_end
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    BOOKS ||--o{ LOANS : book_id
    MEMBERS ||--o{ LOANS : member_id
    USERS ||--o{ NOTIFICATIONS : user_id
    USERS ||--|| NOTIFICATION_PREFERENCES : user_id
```

---

## 3. Tables

### 3.1 `books`

Stores the catalog of books available in the library.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `BIGINT` | Primary key, identity |
| `title` | `VARCHAR(200)` | Not null |
| `author` | `VARCHAR(150)` | Not null |
| `isbn` | `VARCHAR(20)` | Not null, unique |
| `category` | `VARCHAR(100)` | Nullable |
| `published_year` | `INTEGER` | Nullable |
| `total_copies` | `INTEGER` | Not null, default `1` |
| `available_copies` | `INTEGER` | Not null, default `1` |
| `description` | `VARCHAR(500)` | Nullable |

### 3.2 `members`

Represents library members who borrow books.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `BIGINT` | Primary key, identity |
| `name` | `VARCHAR(100)` | Not null |
| `email` | `VARCHAR(150)` | Not null, unique |
| `phone` | `VARCHAR(20)` | Nullable |
| `address` | `VARCHAR(300)` | Nullable |
| `joined_date` | `DATE` | Not null, defaults to current date in application |
| `expiry_date` | `DATE` | Nullable, auto-derived from `joined_date` when absent |
| `status` | `VARCHAR(20)` | Not null, default `ACTIVE` |

### 3.3 `loans`

Tracks issue, due, return, and fine state for each borrowed book.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `BIGINT` | Primary key, identity |
| `book_id` | `BIGINT` | Not null, many-to-one to `books.id` |
| `member_id` | `BIGINT` | Not null, many-to-one to `members.id` |
| `issue_date` | `DATE` | Not null, defaults to current date in application |
| `due_date` | `DATE` | Not null |
| `return_date` | `DATE` | Nullable |
| `fine_amount` | `DECIMAL(10,2)` | Default `0.00` |
| `fine_paid` | `BOOLEAN` | Not null, default `false` |
| `fine_paid_at` | `TIMESTAMP` | Nullable |
| `fine_waived` | `BOOLEAN` | Not null, default `false` |
| `fine_waived_at` | `TIMESTAMP` | Nullable |
| `fine_waived_reason` | `VARCHAR(300)` | Nullable |
| `status` | `VARCHAR(20)` | Not null, enum: `ACTIVE`, `RETURNED`, `OVERDUE` |

### 3.4 `users`

Stores application login accounts for admins, librarians, and member users.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `BIGINT` | Primary key, identity |
| `username` | `VARCHAR(50)` | Not null, unique |
| `password` | `VARCHAR` | Not null |
| `email` | `VARCHAR(150)` | Nullable, unique when present |
| `full_name` | `VARCHAR(100)` | Nullable |
| `phone` | `VARCHAR(20)` | Nullable |
| `role` | `VARCHAR(20)` | Not null, enum: `ADMIN`, `LIBRARIAN`, `MEMBER` |
| `profile_picture` | `VARCHAR(500)` | Nullable |
| `active` | `BOOLEAN` | Not null, default `true` |
| `member_id` | `BIGINT` | Plain column used to link a member user to a member record; not mapped as a JPA relationship |
| `created_at` | `TIMESTAMP` | Not null |
| `updated_at` | `TIMESTAMP` | Not null |

### 3.5 `notifications`

Stores scheduled and delivered notifications for users.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `BIGINT` | Primary key, identity |
| `user_id` | `BIGINT` | Not null, many-to-one to `users.id` |
| `type` | `VARCHAR(50)` | Not null, enum: `DUE_DATE_REMINDER`, `FINE_ALERT`, `NEW_BOOK_ARRIVAL` |
| `title` | `VARCHAR(200)` | Not null |
| `message` | `TEXT` | Not null |
| `delivery_method` | `VARCHAR(20)` | Not null, enum: `IN_APP`, `EMAIL`, `SMS` |
| `status` | `VARCHAR(20)` | Not null, enum: `PENDING`, `SENT`, `FAILED`, `READ` |
| `reference_id` | `BIGINT` | Nullable |
| `reference_type` | `VARCHAR(50)` | Nullable |
| `scheduled_at` | `TIMESTAMP` | Not null |
| `sent_at` | `TIMESTAMP` | Nullable |
| `read_at` | `TIMESTAMP` | Nullable |
| `created_at` | `TIMESTAMP` | Not null |
| `updated_at` | `TIMESTAMP` | Not null |

### 3.6 `notification_preferences`

Stores one notification preference record per user.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `BIGINT` | Primary key, identity |
| `user_id` | `BIGINT` | Not null, unique, one-to-one with `users.id` |
| `due_date_reminder_enabled` | `BOOLEAN` | Not null, default `true` |
| `due_date_reminder_days_before` | `INTEGER` | Not null, default `3` |
| `fine_alert_enabled` | `BOOLEAN` | Not null, default `true` |
| `new_book_arrival_enabled` | `BOOLEAN` | Not null, default `true` |
| `preferred_categories` | `VARCHAR(500)` | Nullable |
| `delivery_method_in_app` | `BOOLEAN` | Not null, default `true` |
| `delivery_method_email` | `BOOLEAN` | Not null, default `true` |
| `delivery_method_sms` | `BOOLEAN` | Not null, default `false` |
| `notification_frequency` | `VARCHAR(20)` | Not null, enum: `IMMEDIATE`, `DAILY`, `WEEKLY` |
| `quiet_hours_start` | `TIME` | Nullable |
| `quiet_hours_end` | `TIME` | Nullable |
| `created_at` | `TIMESTAMP` | Not null |
| `updated_at` | `TIMESTAMP` | Not null |

---

## 4. Relationship Notes

- One `book` can appear in many `loans`.
- One `member` can have many `loans`.
- One `user` can have many `notifications`.
- One `user` has one `notification_preferences` record.
- `users.member_id` is intentionally a scalar field today, not a foreign-key-backed entity association in JPA.

---

## 5. Seed Data Snapshot

The current seeder creates:

- 2 staff users: `admin`, `librarian`
- 5 members
- 2 member-linked user accounts: `member`, `priya`
- 10 sample books

Seeder source:

- `backend/src/main/java/com/library/config/DataSeeder.java`

---

## 6. Source of Truth

If this document and the code ever differ, treat these files as the source of truth:

- `backend/src/main/java/com/library/model/Book.java`
- `backend/src/main/java/com/library/model/Member.java`
- `backend/src/main/java/com/library/model/Loan.java`
- `backend/src/main/java/com/library/model/User.java`
- `backend/src/main/java/com/library/model/Notification.java`
- `backend/src/main/java/com/library/model/NotificationPreference.java`
- `backend/src/main/resources/schema.sql`
