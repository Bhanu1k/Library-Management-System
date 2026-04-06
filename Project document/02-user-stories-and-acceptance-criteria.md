# 02 — User Stories & Acceptance Criteria
# Library Management System

---

## ADMIN Stories

---

### US-001 — Admin Login
**As an** Admin,
**I want to** log in with my username and password,
**So that** I can securely access the library management system.

**Acceptance Criteria:**
- [ ] Login form accepts username and password
- [ ] On success: JWT token returned, user redirected to dashboard
- [ ] On failure: error message "Invalid credentials" shown
- [ ] Password is BCrypt-verified on backend
- [ ] Token stored in localStorage

---

### US-002 — Admin Creates User Account
**As an** Admin,
**I want to** create accounts for Librarians and Members,
**So that** staff and members can access the system with proper roles.

**Acceptance Criteria:**
- [ ] Admin can POST to `/api/auth/register` with role field
- [ ] Non-admin users cannot access this endpoint (403)
- [ ] Duplicate username/email returns validation error
- [ ] Password stored as BCrypt hash

---

### US-003 — Admin Views Dashboard
**As an** Admin,
**I want to** see a summary dashboard,
**So that** I can monitor the library at a glance.

**Acceptance Criteria:**
- [ ] Dashboard shows: total books, total members, active loans, overdue loans
- [ ] Stats load within 500ms
- [ ] Data is real-time (fetched from backend on page load)

---

## LIBRARIAN Stories

---

### US-004 — Add a New Book
**As a** Librarian,
**I want to** add a new book to the catalog,
**So that** it becomes available for members to borrow.

**Acceptance Criteria:**
- [ ] Form fields: title, author, ISBN, category, total copies, published year
- [ ] ISBN must be unique — duplicate returns error
- [ ] Available copies = total copies on creation
- [ ] Book appears in book list immediately after add
- [ ] Empty required fields show validation messages

---

### US-005 — Search for a Book
**As a** Librarian,
**I want to** search books by title, author, or ISBN,
**So that** I can quickly find a book during member requests.

**Acceptance Criteria:**
- [ ] Search bar on books page
- [ ] Results filter in real-time or on submit
- [ ] Shows book availability (available / total)
- [ ] Empty search returns all books

---

### US-006 — Edit a Book
**As a** Librarian,
**I want to** update book details,
**So that** the catalog stays accurate.

**Acceptance Criteria:**
- [ ] Edit button opens form pre-filled with existing data
- [ ] All fields editable except ISBN
- [ ] Changes saved via PUT `/api/books/{id}`
- [ ] Updated data reflects in list immediately

---

### US-007 — Delete a Book
**As an** Admin,
**I want to** delete a book from the catalog,
**So that** outdated or damaged books are removed.

**Acceptance Criteria:**
- [ ] Delete only allowed if no active loans on that book
- [ ] Confirmation dialog before delete
- [ ] Book removed from list on success
- [ ] Returns 400 with message if active loans exist

---

### US-008 — Register a New Member
**As a** Librarian,
**I want to** register a new library member,
**So that** they can borrow books.

**Acceptance Criteria:**
- [ ] Form fields: name, email, phone, address, joined date
- [ ] Email must be unique
- [ ] Member status defaults to ACTIVE
- [ ] Member appears in member list after registration

---

### US-009 — Issue a Book
**As a** Librarian,
**I want to** issue a book to a member,
**So that** the loan is tracked in the system.

**Acceptance Criteria:**
- [ ] Select member by name/ID and book by title/ISBN
- [ ] Issue date = today, due date = today + 14 days
- [ ] Available copies of book reduced by 1
- [ ] Error if book has 0 available copies
- [ ] Loan appears in active loans list
- [ ] Error if member has existing overdue loans

---

### US-010 — Return a Book
**As a** Librarian,
**I want to** process a book return,
**So that** the book becomes available again and fines are calculated.

**Acceptance Criteria:**
- [ ] Return date = today
- [ ] If return date > due date: fine = (days late × ₹5)
- [ ] Available copies of book increased by 1
- [ ] Loan status changes to RETURNED
- [ ] Fine amount displayed on return confirmation

---

### US-011 — View Overdue Loans
**As a** Librarian,
**I want to** view all overdue loans,
**So that** I can follow up with members.

**Acceptance Criteria:**
- [ ] GET `/api/loans/overdue` returns loans past due date with status ACTIVE
- [ ] Shows member name, book title, due date, days overdue
- [ ] Sorted by most overdue first

---

## MEMBER Stories

---

### US-012 — Member Views Own Loans
**As a** Member,
**I want to** view my active and past loans,
**So that** I know what books I have and when they are due.

**Acceptance Criteria:**
- [ ] Member sees only their own loans (not others')
- [ ] Shows book title, issue date, due date, status
- [ ] Overdue loans highlighted in red
- [ ] Fine amount shown for returned loans

---

### US-013 — Member Views Available Books
**As a** Member,
**I want to** browse available books,
**So that** I can choose what to borrow next.

**Acceptance Criteria:**
- [ ] Member can view book list (read-only)
- [ ] Search by title/author available
- [ ] Shows available copies count
- [ ] Cannot add/edit/delete books
