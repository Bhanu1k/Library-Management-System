# 06 — API Contracts
# Library Management System

**Base URL**: `http://localhost:8085/api`
**Auth**: All endpoints (except `/auth/login`) require `Authorization: Bearer <token>`
**Content-Type**: `application/json`

---

## 1. Auth APIs

### POST `/auth/login`
Login and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ADMIN"
}
```

**Response 401:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid username or password"
}
```

---

### POST `/auth/register`
Create a new system user. **[ADMIN only]**

**Request:**
```json
{
  "username": "librarian1",
  "password": "pass123",
  "email": "lib1@library.com",
  "role": "LIBRARIAN"
}
```

**Response 201:**
```json
{
  "id": 2,
  "username": "librarian1",
  "email": "lib1@library.com",
  "role": "LIBRARIAN"
}
```

**Response 409 (Duplicate):**
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Username already exists"
}
```

---

## 2. Book APIs

### GET `/books`
Get all books. **[ALL roles]**

**Query Params (optional):**
- `search` — filter by title/author/ISBN
- `category` — filter by category
- `page` — page number (default 0)
- `size` — page size (default 10)

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "9780132350884",
      "category": "Technology",
      "totalCopies": 3,
      "availableCopies": 2,
      "publishedYear": 2008
    }
  ],
  "totalElements": 25,
  "totalPages": 3,
  "currentPage": 0
}
```

---

### GET `/books/{id}`
Get single book by ID. **[ALL roles]**

**Response 200:**
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "category": "Technology",
  "totalCopies": 3,
  "availableCopies": 2,
  "publishedYear": 2008,
  "description": "A handbook of Agile software craftsmanship"
}
```

**Response 404:**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Book with ID 1 not found"
}
```

---

### POST `/books`
Add a new book. **[ADMIN, LIBRARIAN]**

**Request:**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "category": "Technology",
  "totalCopies": 3,
  "publishedYear": 2008,
  "description": "Optional description"
}
```

**Response 201:**
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "category": "Technology",
  "totalCopies": 3,
  "availableCopies": 3
}
```

---

### PUT `/books/{id}`
Update book. **[ADMIN, LIBRARIAN]**

**Request:** (same fields as POST, ISBN not editable)

**Response 200:** Updated book object.

---

### DELETE `/books/{id}`
Delete book. **[ADMIN only]**

**Response 200:**
```json
{
  "message": "Book deleted successfully"
}
```

**Response 400 (Active Loans Exist):**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Cannot delete book with active loans"
}
```

---

## 3. Member APIs

### GET `/members`
Get all members. **[ADMIN, LIBRARIAN]**

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Arjun Kumar",
    "email": "arjun@email.com",
    "phone": "9876543210",
    "status": "ACTIVE",
    "joinedDate": "2026-01-15"
  }
]
```

---

### GET `/members/{id}`
Get single member. **[ADMIN, LIBRARIAN]**

**Response 200:** Single member object with loan history count.

---

### POST `/members`
Register a new member. **[ADMIN, LIBRARIAN]**

**Request:**
```json
{
  "name": "Arjun Kumar",
  "email": "arjun@email.com",
  "phone": "9876543210",
  "address": "Bengaluru, Karnataka"
}
```

**Response 201:** Created member object.

---

### PUT `/members/{id}`
Update member. **[ADMIN, LIBRARIAN]**

**Response 200:** Updated member object.

---

### DELETE `/members/{id}`
Deactivate member. **[ADMIN]**

**Response 200:**
```json
{
  "message": "Member deactivated successfully"
}
```

---

## 4. Loan APIs

### GET `/loans`
Get all loans. **[ADMIN, LIBRARIAN]**

**Query Params:** `status=ACTIVE|RETURNED|OVERDUE`

**Response 200:**
```json
[
  {
    "id": 1,
    "book": { "id": 1, "title": "Clean Code" },
    "member": { "id": 1, "name": "Arjun Kumar" },
    "issueDate": "2026-03-01",
    "dueDate": "2026-03-15",
    "returnDate": null,
    "fineAmount": 0.00,
    "status": "ACTIVE"
  }
]
```

---

### GET `/loans/overdue`
Get all overdue loans. **[ADMIN, LIBRARIAN]**

**Response 200:** List of loans with `status=ACTIVE` and `dueDate < today`.

---

### GET `/loans/member/{memberId}`
Get loans for a specific member. **[ADMIN, LIBRARIAN, MEMBER(own only)]**

---

### POST `/loans/issue`
Issue a book to a member. **[ADMIN, LIBRARIAN]**

**Request:**
```json
{
  "bookId": 1,
  "memberId": 1
}
```

**Response 201:**
```json
{
  "id": 101,
  "book": { "id": 1, "title": "Clean Code" },
  "member": { "id": 1, "name": "Arjun Kumar" },
  "issueDate": "2026-03-23",
  "dueDate": "2026-04-06",
  "status": "ACTIVE",
  "fineAmount": 0.00
}
```

**Response 400 (No Copies):**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "No available copies of this book"
}
```

---

### PUT `/loans/return/{id}`
Return a book. **[ADMIN, LIBRARIAN]**

**Response 200:**
```json
{
  "id": 101,
  "returnDate": "2026-04-10",
  "dueDate": "2026-04-06",
  "daysLate": 4,
  "fineAmount": 20.00,
  "status": "RETURNED"
}
```

---

## 5. Dashboard API

### GET `/dashboard/stats`
Get library summary statistics. **[ADMIN, LIBRARIAN]**

**Response 200:**
```json
{
  "totalBooks": 150,
  "totalMembers": 320,
  "activeLoans": 45,
  "overdueLoans": 8,
  "recentLoans": [
    {
      "bookTitle": "Clean Code",
      "memberName": "Arjun Kumar",
      "issueDate": "2026-03-23",
      "status": "ACTIVE"
    }
  ]
}
```

---

## 6. Standard Error Response Format

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Human-readable error message",
  "timestamp": "2026-03-23T10:30:00"
}
```

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal Server Error |
