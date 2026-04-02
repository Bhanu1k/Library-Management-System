# 05 — Database Schema
# Library Management System — Microsoft SQL Server

---

## 1. Database Setup

```sql
-- Run in SSMS
CREATE DATABASE library_db;
GO
USE library_db;
GO
```

---

## 2. Tables

### 2.1 users
Stores system user accounts (Admin, Librarian, Member).

```sql
CREATE TABLE users (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    username    NVARCHAR(50)  NOT NULL UNIQUE,
    password    NVARCHAR(255) NOT NULL,          -- BCrypt hash
    email       NVARCHAR(100) NOT NULL UNIQUE,
    role        NVARCHAR(20)  NOT NULL DEFAULT 'MEMBER'
                    CHECK (role IN ('ADMIN', 'LIBRARIAN', 'MEMBER')),
    is_active   BIT           NOT NULL DEFAULT 1,
    created_at  DATETIME2     NOT NULL DEFAULT GETDATE()
);
```

### 2.2 books
Catalog of all library books.

```sql
CREATE TABLE books (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    title            NVARCHAR(255) NOT NULL,
    author           NVARCHAR(150) NOT NULL,
    isbn             NVARCHAR(20)  NOT NULL UNIQUE,
    category         NVARCHAR(100),
    total_copies     INT           NOT NULL DEFAULT 1,
    available_copies INT           NOT NULL DEFAULT 1,
    published_year   INT,
    description      NVARCHAR(MAX),
    created_at       DATETIME2     NOT NULL DEFAULT GETDATE(),
    updated_at       DATETIME2     NOT NULL DEFAULT GETDATE(),

    CONSTRAINT chk_copies CHECK (available_copies >= 0),
    CONSTRAINT chk_total CHECK (total_copies >= 1)
);
```

### 2.3 members
Library subscribers who can borrow books.

```sql
CREATE TABLE members (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL,
    email       NVARCHAR(100) NOT NULL UNIQUE,
    phone       NVARCHAR(15),
    address     NVARCHAR(MAX),
    status      NVARCHAR(10)  NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'INACTIVE')),
    joined_date DATE          NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    created_at  DATETIME2     NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2     NOT NULL DEFAULT GETDATE()
);
```

### 2.4 loans
Tracks all book issue and return transactions.

```sql
CREATE TABLE loans (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    book_id      BIGINT         NOT NULL,
    member_id    BIGINT         NOT NULL,
    issue_date   DATE           NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    due_date     DATE           NOT NULL,
    return_date  DATE           NULL,
    fine_amount  DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    status       NVARCHAR(10)   NOT NULL DEFAULT 'ACTIVE'
                     CHECK (status IN ('ACTIVE', 'RETURNED', 'OVERDUE')),
    created_at   DATETIME2      NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_loan_book   FOREIGN KEY (book_id)   REFERENCES books(id),
    CONSTRAINT fk_loan_member FOREIGN KEY (member_id) REFERENCES members(id)
);
```

---

## 3. Entity Relationship Diagram

```
┌──────────────┐           ┌──────────────┐
│    members   │           │    books     │
├──────────────┤           ├──────────────┤
│ id (PK)      │           │ id (PK)      │
│ name         │           │ title        │
│ email        │           │ author       │
│ phone        │           │ isbn         │
│ address      │           │ category     │
│ status       │           │ total_copies │
│ joined_date  │           │ avail_copies │
│ created_at   │           │ published_yr │
└──────┬───────┘           └──────┬───────┘
       │                          │
       │  ┌───────────────────┐   │
       └─►│       loans       │◄──┘
          ├───────────────────┤
          │ id (PK)           │
          │ book_id   (FK)    │
          │ member_id (FK)    │
          │ issue_date        │
          │ due_date          │
          │ return_date       │
          │ fine_amount       │
          │ status            │
          └───────────────────┘

┌──────────────┐
│    users     │  (independent — manages system login)
├──────────────┤
│ id (PK)      │
│ username     │
│ password     │
│ email        │
│ role         │
│ is_active    │
└──────────────┘
```

---

## 4. Indexes

```sql
-- Speed up book searches
CREATE INDEX idx_books_title  ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn   ON books(isbn);

-- Speed up member lookups
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_name  ON members(name);

-- Speed up loan queries
CREATE INDEX idx_loans_status    ON loans(status);
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_book_id   ON loans(book_id);
CREATE INDEX idx_loans_due_date  ON loans(due_date);
```

---

## 5. Seed Data (Initial Setup)

```sql
-- Default Admin Account (password: admin123)
INSERT INTO users (username, password, email, role)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- BCrypt of 'admin123'
    'admin@library.com',
    'ADMIN'
);

-- Sample Books
INSERT INTO books (title, author, isbn, category, total_copies, available_copies, published_year)
VALUES
    ('Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 3, 3, 2008),
    ('The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 'Technology', 2, 2, 1999),
    ('Design Patterns', 'Gang of Four', '9780201633610', 'Technology', 2, 2, 1994),
    ('Atomic Habits', 'James Clear', '9780735211292', 'Self-Help', 4, 4, 2018),
    ('To Kill a Mockingbird', 'Harper Lee', '9780061935466', 'Fiction', 3, 3, 1960);

-- Sample Members
INSERT INTO members (name, email, phone, status, joined_date)
VALUES
    ('Arjun Kumar', 'arjun@email.com', '9876543210', 'ACTIVE', '2026-01-15'),
    ('Priya Sharma', 'priya@email.com', '9876543211', 'ACTIVE', '2026-02-10'),
    ('Rahul Verma', 'rahul@email.com', '9876543212', 'ACTIVE', '2026-03-01');
```

---

## 6. Useful Queries

```sql
-- View all active loans with book and member details
SELECT
    l.id,
    b.title AS book_title,
    m.name  AS member_name,
    l.issue_date,
    l.due_date,
    l.status,
    l.fine_amount
FROM loans l
JOIN books   b ON l.book_id   = b.id
JOIN members m ON l.member_id = m.id
WHERE l.status = 'ACTIVE';

-- Find all overdue loans
SELECT
    l.id,
    b.title,
    m.name,
    l.due_date,
    DATEDIFF(DAY, l.due_date, GETDATE()) AS days_overdue,
    DATEDIFF(DAY, l.due_date, GETDATE()) * 5.00 AS fine_amount
FROM loans l
JOIN books   b ON l.book_id   = b.id
JOIN members m ON l.member_id = m.id
WHERE l.status = 'ACTIVE'
  AND l.due_date < CAST(GETDATE() AS DATE);

-- Dashboard stats
SELECT
    (SELECT COUNT(*) FROM books)                          AS total_books,
    (SELECT COUNT(*) FROM members WHERE status='ACTIVE') AS total_members,
    (SELECT COUNT(*) FROM loans WHERE status='ACTIVE')   AS active_loans,
    (SELECT COUNT(*) FROM loans
     WHERE status='ACTIVE'
       AND due_date < CAST(GETDATE() AS DATE))           AS overdue_loans;
```

---

## 7. Spring Boot SSMS Configuration

```properties
# application.properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=library_db;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
```

```xml
<!-- pom.xml dependency -->
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <scope>runtime</scope>
</dependency>
```
