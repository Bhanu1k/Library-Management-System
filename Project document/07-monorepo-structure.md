# 07 — Monorepo Structure
# Library Management System

---

## 1. Root Project Layout

```
library-management-system/
│
├── README.md                        ← Project overview & setup guide
├── .gitignore
│
├── frontend/                        ← HTML/CSS/JS Frontend
│   ├── index.html                   ← Login page
│   ├── dashboard.html
│   ├── books.html
│   ├── members.html
│   ├── loans.html
│   ├── profile.html
│   │
│   ├── css/
│   │   ├── style.css                ← Global styles, variables, reset
│   │   ├── dashboard.css
│   │   ├── books.css
│   │   ├── members.css
│   │   ├── loans.css
│   │   └── components.css           ← Reusable: modals, tables, cards
│   │
│   └── js/
│       ├── api.js                   ← Base fetch wrapper + auth headers
│       ├── auth.js                  ← Login, logout, token management
│       ├── dashboard.js
│       ├── books.js
│       ├── members.js
│       ├── loans.js
│       └── utils.js                 ← Shared helpers (toast, format, etc.)
│
├── backend/                         ← Spring Boot Backend
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   │
│   └── src/
│       ├── main/
│       │   ├── java/com/library/
│       │   │   ├── LibraryApplication.java
│       │   │   │
│       │   │   ├── controller/
│       │   │   │   ├── AuthController.java
│       │   │   │   ├── BookController.java
│       │   │   │   ├── MemberController.java
│       │   │   │   ├── LoanController.java
│       │   │   │   └── DashboardController.java
│       │   │   │
│       │   │   ├── service/
│       │   │   │   ├── AuthService.java
│       │   │   │   ├── BookService.java
│       │   │   │   ├── MemberService.java
│       │   │   │   ├── LoanService.java
│       │   │   │   └── DashboardService.java
│       │   │   │
│       │   │   ├── repository/
│       │   │   │   ├── UserRepository.java
│       │   │   │   ├── BookRepository.java
│       │   │   │   ├── MemberRepository.java
│       │   │   │   └── LoanRepository.java
│       │   │   │
│       │   │   ├── model/
│       │   │   │   ├── User.java
│       │   │   │   ├── Book.java
│       │   │   │   ├── Member.java
│       │   │   │   └── Loan.java
│       │   │   │
│       │   │   ├── dto/
│       │   │   │   ├── request/
│       │   │   │   │   ├── LoginRequest.java
│       │   │   │   │   ├── RegisterRequest.java
│       │   │   │   │   ├── BookRequest.java
│       │   │   │   │   ├── MemberRequest.java
│       │   │   │   │   └── LoanRequest.java
│       │   │   │   └── response/
│       │   │   │       ├── AuthResponse.java
│       │   │   │       ├── BookResponse.java
│       │   │   │       ├── MemberResponse.java
│       │   │   │       ├── LoanResponse.java
│       │   │   │       └── DashboardStats.java
│       │   │   │
│       │   │   ├── security/
│       │   │   │   ├── JwtUtil.java
│       │   │   │   ├── JwtAuthFilter.java
│       │   │   │   ├── UserDetailsServiceImpl.java
│       │   │   │   └── SecurityConfig.java
│       │   │   │
│       │   │   └── exception/
│       │   │       ├── GlobalExceptionHandler.java
│       │   │       ├── ResourceNotFoundException.java
│       │   │       ├── BookNotAvailableException.java
│       │   │       └── DuplicateEntryException.java
│       │   │
│       │   └── resources/
│       │       ├── application.properties       ← Main config
│       │       ├── application-dev.properties   ← Dev overrides
│       │       └── application-prod.properties  ← Prod overrides
│       │
│       └── test/
│           └── java/com/library/
│               ├── controller/
│               │   └── BookControllerTest.java
│               ├── service/
│               │   ├── BookServiceTest.java
│               │   └── LoanServiceTest.java
│               └── repository/
│                   └── BookRepositoryTest.java
│
└── docs/                            ← Project documentation
    ├── 01-product-requirements.md
    ├── 02-user-stories-and-acceptance-criteria.md
    ├── 03-information-architecture.md
    ├── 04-system-architecture.md
    ├── 05-database-schema.md
    ├── 06-api-contracts.md
    ├── 07-monorepo-structure.md
    ├── 08-scoring-engine-spec.md
    ├── 09-engineering-scope-definition.md
    ├── 10-development-phases.md
    ├── 11-environment-and-devops.md
    └── 12-testing-strategy.md
```

---

## 2. File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Java Classes | PascalCase | `BookController.java` |
| Java Packages | lowercase | `com.library.service` |
| HTML Files | kebab-case | `books.html` |
| CSS Files | kebab-case | `books.css` |
| JS Files | camelCase | `books.js` |
| MD Docs | kebab-case | `01-product-requirements.md` |
| DB Tables | snake_case | `loan_history` |
| DB Columns | snake_case | `available_copies` |
| API Endpoints | kebab-case | `/api/active-loans` |

---

## 3. .gitignore

```gitignore
# Maven
target/
*.class
*.jar

# IDE
.idea/
*.iml
.vscode/

# Environment
application-prod.properties
*.env

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
```

---

## 4. README.md Outline

```markdown
# Library Management System

## Tech Stack
- Frontend: HTML5, CSS3, JavaScript
- Backend: Java 17 + Spring Boot 3.x
- Database: Microsoft SQL Server (SSMS)
- Auth: JWT + Spring Security

## Setup

### Prerequisites
- Java 17+
- Maven 3.x
- SQL Server 2019+ with SSMS
- VS Code with Live Server extension

### Backend Setup
1. Create database `library_db` in SSMS
2. Update `application.properties` with your SQL Server credentials
3. Run: `cd backend && mvn spring-boot:run`

### Frontend Setup
1. Open `frontend/` in VS Code
2. Right-click `index.html` → Open with Live Server

## Default Credentials
- Admin: `admin / admin123`
```
