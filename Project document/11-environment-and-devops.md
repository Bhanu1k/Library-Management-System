# 11 — Environment & DevOps
# Library Management System

---

## 1. Development Environment Setup

### 1.1 Required Software

| Software | Version | Purpose | Download |
|----------|---------|---------|----------|
| Java JDK | 17+ | Backend runtime | adoptium.net |
| Maven | 3.x | Build tool | maven.apache.org |
| SQL Server | 2019+ | Database | microsoft.com |
| SSMS | Latest | DB GUI | microsoft.com |
| IntelliJ IDEA | Latest | Backend IDE | jetbrains.com |
| VS Code | Latest | Frontend IDE | code.visualstudio.com |
| Git | Latest | Version control | git-scm.com |
| Postman | Latest | API testing | postman.com |

### 1.2 VS Code Extensions
```
- Live Server          (serve frontend locally)
- Prettier             (code formatting)
- REST Client          (test APIs from VS Code)
```

### 1.3 IntelliJ IDEA Plugins
```
- Lombok Plugin        (required for @Data, @Builder annotations)
- Spring Boot Plugin   (run/debug Spring apps)
```

---

## 2. Environment Configuration

### 2.1 Backend — application.properties

**Development (`application-dev.properties`):**
```properties
# Server
server.port=8085

# SQL Server (SSMS)
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=library_db;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=YourDevPassword123
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
spring.jpa.properties.hibernate.format_sql=true

# JWT
jwt.secret=mySecretKeyForLibraryManagementSystem2026!
jwt.expiration=86400000

# CORS
cors.allowed-origin=http://localhost:5500

# Logging
logging.level.com.library=DEBUG
logging.level.org.springframework.security=DEBUG
```

**Production (`application-prod.properties`):**
```properties
# Server
server.port=8085

# SQL Server
spring.datasource.url=jdbc:sqlserver://PROD_SERVER:1433;databaseName=library_db;encrypt=true;trustServerCertificate=false
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# Logging
logging.level.root=WARN
logging.level.com.library=INFO
```

---

## 3. Database Setup (SSMS)

### 3.1 Step-by-Step SSMS Setup

```sql
-- Step 1: Open SSMS → Connect to localhost\SQLEXPRESS (or localhost)
-- Step 2: Create database
CREATE DATABASE library_db;
GO

-- Step 3: Switch to new database
USE library_db;
GO

-- Step 4: Run schema from 05-database-schema.md
-- (copy-paste all CREATE TABLE statements)

-- Step 5: Run seed data inserts

-- Step 6: Verify
SELECT * FROM users;
SELECT * FROM books;
```

### 3.2 SQL Server Authentication Mode
- In SSMS: Right-click Server → Properties → Security
- Set to **"SQL Server and Windows Authentication mode"**
- Enable the `sa` account:
```sql
ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = 'YourPassword123';
```

---

## 4. Running the Project Locally

### 4.1 Start Backend
```bash
# Clone the repo
git clone https://github.com/Bhanu1k/library-management-system.git
cd library-management-system/backend

# Build
mvn clean install

# Run with dev profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Backend runs at: http://localhost:8085
```

### 4.2 Start Frontend
```bash
# In VS Code:
# 1. Open frontend/ folder
# 2. Right-click index.html
# 3. Click "Open with Live Server"

# Frontend runs at: http://localhost:5500
```

### 4.3 Verify Setup
```
1. Open http://localhost:5500 → Login page appears
2. Login with admin / admin123
3. Dashboard loads with stats
4. Check SSMS → loans table → should be empty initially
```

---

## 5. Git Workflow

### 5.1 Branching Strategy
```
main          ← stable, production-ready
  └── dev     ← integration branch
        ├── feature/auth
        ├── feature/book-management
        ├── feature/member-management
        ├── feature/loan-management
        └── feature/dashboard
```

### 5.2 Commit Message Format
```
feat: add book search by ISBN
fix: correct fine calculation for same-day return
docs: update API contracts for loans
refactor: extract fine logic to FineCalculator utility
test: add unit tests for LoanService
```

### 5.3 Git Commands
```bash
# Create feature branch
git checkout -b feature/book-management

# Stage and commit
git add .
git commit -m "feat: implement book CRUD endpoints"

# Push
git push origin feature/book-management

# Merge to dev (via PR / directly)
git checkout dev
git merge feature/book-management
```

---

## 6. API Testing with Postman

### 6.1 Setup Postman Collection

Create a collection: `Library Management System`

Add environment variables:
```
base_url = http://localhost:8085/api
token    = (set after login)
```

### 6.2 Auth Flow in Postman

**Step 1 — Login:**
```
POST {{base_url}}/auth/login
Body: { "username": "admin", "password": "admin123" }
→ Copy token from response
→ Set as environment variable: token = <copied value>
```

**Step 2 — Use Token:**
```
All other requests:
Headers → Authorization: Bearer {{token}}
```

---

## 7. Deployment (Future — Phase 2)

### Option A: Manual Server Deploy
```
1. Build JAR: mvn clean package -Pprod
2. Copy target/library-0.0.1-SNAPSHOT.jar to server
3. Run: java -jar library-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
4. Upload frontend/ to web server (Nginx / Apache)
```

### Option B: Cloud (Railway / Render)
```
1. Push backend to GitHub
2. Connect to Railway → auto-deploy Spring Boot
3. Add SQL Server connection string as environment variable
4. Deploy frontend to Vercel (static HTML)
```

---

## 8. Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `Connection refused localhost:1433` | SQL Server not running | Start SQL Server service in Windows Services |
| `Login failed for user 'sa'` | sa account disabled | Enable sa login in SSMS Security settings |
| `CORS error in browser` | CORS not configured | Check `SecurityConfig.java` allowed origins |
| `401 on all requests` | JWT expired or missing | Re-login to get fresh token |
| `Port 8085 already in use` | Another process running | `netstat -ano | findstr :8085` then kill process |
| `DDL-auto=update fails` | Schema mismatch | Drop and recreate tables, re-run seed |
