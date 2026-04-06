# 03 — Information Architecture
# Library Management System

---

## 1. Site Map

```
LMS Web Application
│
├── 🔐 Login Page                    (Public)
│       index.html
│
├── 📊 Dashboard                     (ADMIN / LIBRARIAN)
│       dashboard.html
│       - Total Books Card
│       - Total Members Card
│       - Active Loans Card
│       - Overdue Loans Card
│       - Recent Activity Feed
│
├── 📚 Books Module                  (ADMIN / LIBRARIAN / MEMBER*)
│       books.html
│       - Book List Table
│       - Search & Filter Bar
│       - Add Book Form             (ADMIN / LIBRARIAN)
│       - Edit Book Form            (ADMIN / LIBRARIAN)
│       - Delete Book               (ADMIN only)
│
├── 👥 Members Module                (ADMIN / LIBRARIAN)
│       members.html
│       - Member List Table
│       - Search Member Bar
│       - Register Member Form
│       - Edit Member Form
│       - Deactivate Member
│
├── 🔄 Loans Module                  (ADMIN / LIBRARIAN)
│       loans.html
│       - Active Loans Table
│       - Overdue Loans Tab
│       - Loan History Tab
│       - Issue Book Form
│       - Return Book Action
│
└── 👤 Profile / Account             (ALL roles)
        profile.html
        - View own account info
        - Change password
```

---

## 2. Navigation Structure

### Admin Navigation Bar
```
[📊 Dashboard] [📚 Books] [👥 Members] [🔄 Loans] [👤 Profile] [🚪 Logout]
```

### Librarian Navigation Bar
```
[📊 Dashboard] [📚 Books] [👥 Members] [🔄 Loans] [👤 Profile] [🚪 Logout]
```

### Member Navigation Bar
```
[📚 Books (View Only)] [🔄 My Loans] [👤 Profile] [🚪 Logout]
```

---

## 3. Page-Level Information Architecture

### 3.1 Login Page (`index.html`)
```
┌────────────────────────────────┐
│        LMS Logo / Title        │
│                                │
│   [Username Input]             │
│   [Password Input]             │
│   [Login Button]               │
│                                │
│   Error Message (if any)       │
└────────────────────────────────┘
```

### 3.2 Dashboard (`dashboard.html`)
```
┌──────────────────────────────────────────────────┐
│  Header: Welcome, {username} | Role | Logout     │
├──────────┬──────────┬──────────┬─────────────────┤
│📚 Books  │👥 Members│🔄 Loans  │⚠️ Overdue        │
│  Total   │  Total   │ Active   │  Count          │
├──────────┴──────────┴──────────┴─────────────────┤
│              Recent Loan Activity                │
│  Book Title | Member | Issue Date | Status       │
└──────────────────────────────────────────────────┘
```

### 3.3 Books Page (`books.html`)
```
┌──────────────────────────────────────────────────┐
│  [+ Add Book]          [Search: ______________]  │
├──────────────────────────────────────────────────┤
│ ID | Title | Author | ISBN | Category | Avail   │
│ ── | ───── | ────── | ──── | ──────── | ─────   │
│  1 | ...   | ...    | ...  | ...      | 3/5     │
│  2 | ...   | ...    | ...  | ...      | 0/2     │
├──────────────────────────────────────────────────┤
│                  [Edit] [Delete]                 │
└──────────────────────────────────────────────────┘
```

### 3.4 Members Page (`members.html`)
```
┌──────────────────────────────────────────────────┐
│  [+ Register Member]   [Search: ______________]  │
├──────────────────────────────────────────────────┤
│ ID | Name | Email | Phone | Status | Joined     │
│ ── | ──── | ───── | ───── | ────── | ──────     │
│  1 | ...  | ...   | ...   | ACTIVE | Jan 2026   │
├──────────────────────────────────────────────────┤
│              [Edit] [View Loans] [Deactivate]    │
└──────────────────────────────────────────────────┘
```

### 3.5 Loans Page (`loans.html`)
```
┌──────────────────────────────────────────────────┐
│  [Issue Book]    [Active] [Overdue] [History]    │
├──────────────────────────────────────────────────┤
│ ID | Book | Member | Issued | Due | Status | Fine│
│ ── | ──── | ────── | ────── | ─── | ────── | ───│
│  1 | ...  | ...    | ...    | ... | ACTIVE |  0  │
│  2 | ...  | ...    | ...    | ... |OVERDUE | ₹35 │
├──────────────────────────────────────────────────┤
│                        [Return Book]             │
└──────────────────────────────────────────────────┘
```

---

## 4. Data Flow per Page

| Page | GET (Load) | POST/PUT/DELETE (Action) |
|------|-----------|--------------------------|
| Login | — | POST `/api/auth/login` |
| Dashboard | GET `/api/dashboard/stats` | — |
| Books | GET `/api/books` | POST/PUT/DELETE `/api/books` |
| Members | GET `/api/members` | POST/PUT/DELETE `/api/members` |
| Loans | GET `/api/loans` | POST `/api/loans/issue`, PUT `/api/loans/return/{id}` |

---

## 5. Component Reuse Map

| Component | Used In |
|-----------|---------|
| Navbar | All pages |
| Search Bar | Books, Members, Loans |
| Data Table | Books, Members, Loans |
| Modal Form | Add/Edit Book, Add/Edit Member, Issue Loan |
| Stat Card | Dashboard |
| Toast Notification | All pages (success/error feedback) |
| Confirmation Dialog | Delete Book, Deactivate Member, Return Book |
