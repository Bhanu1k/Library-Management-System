# 12 — Testing Strategy
# Library Management System

---

## 1. Testing Overview

| Level | Type | Tool | Coverage Target |
|-------|------|------|----------------|
| Unit | Service layer logic | JUnit 5 + Mockito | 80%+ |
| Integration | Controller + DB | Spring Boot Test | Key flows |
| API | REST endpoints | Postman | All endpoints |
| Manual | End-to-end UI | Browser | All user stories |

---

## 2. Unit Tests — Service Layer

### 2.1 BookServiceTest

```java
@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock BookRepository bookRepo;
    @InjectMocks BookService bookService;

    @Test
    void shouldAddBookSuccessfully() {
        BookRequest req = new BookRequest("Clean Code", "Robert Martin",
                                          "1234567890", "Technology", 3, 2008);
        Book savedBook = new Book(1L, "Clean Code", "Robert Martin",
                                   "1234567890", "Technology", 3, 3, 2008);
        when(bookRepo.save(any(Book.class))).thenReturn(savedBook);

        BookResponse result = bookService.addBook(req);

        assertNotNull(result);
        assertEquals("Clean Code", result.getTitle());
        assertEquals(3, result.getAvailableCopies());
    }

    @Test
    void shouldThrowWhenBookNotFound() {
        when(bookRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> bookService.getBookById(99L));
    }

    @Test
    void shouldThrowWhenDeletingBookWithActiveLoans() {
        when(bookRepo.findById(1L)).thenReturn(Optional.of(new Book()));
        when(loanRepo.existsByBookIdAndStatus(1L, LoanStatus.ACTIVE)).thenReturn(true);
        assertThrows(IllegalStateException.class, () -> bookService.deleteBook(1L));
    }
}
```

---

### 2.2 LoanServiceTest

```java
@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock LoanRepository loanRepo;
    @Mock BookRepository bookRepo;
    @Mock MemberRepository memberRepo;
    @InjectMocks LoanService loanService;

    @Test
    void shouldIssueBookSuccessfully() {
        Book book = new Book(); book.setId(1L); book.setAvailableCopies(2);
        Member member = new Member(); member.setId(1L); member.setStatus(MemberStatus.ACTIVE);

        when(bookRepo.findById(1L)).thenReturn(Optional.of(book));
        when(memberRepo.findById(1L)).thenReturn(Optional.of(member));
        when(loanRepo.existsByMemberIdAndStatusAndDueDateBefore(any(), any(), any())).thenReturn(false);
        when(loanRepo.countByMemberIdAndStatus(any(), any())).thenReturn(0);
        when(loanRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        LoanResponse result = loanService.issueBook(1L, 1L);

        assertNotNull(result);
        assertEquals(LoanStatus.ACTIVE, result.getStatus());
        assertEquals(LocalDate.now().plusDays(14), result.getDueDate());
        assertEquals(1, book.getAvailableCopies()); // decreased by 1
    }

    @Test
    void shouldThrowWhenNoCopiesAvailable() {
        Book book = new Book(); book.setAvailableCopies(0);
        when(bookRepo.findById(1L)).thenReturn(Optional.of(book));
        assertThrows(BookNotAvailableException.class, () -> loanService.issueBook(1L, 1L));
    }

    @Test
    void shouldCalculateFineOnLateReturn() {
        Loan loan = new Loan();
        loan.setDueDate(LocalDate.now().minusDays(5));
        loan.setBook(new Book()); loan.getBook().setAvailableCopies(0);
        when(loanRepo.findById(1L)).thenReturn(Optional.of(loan));
        when(loanRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        LoanResponse result = loanService.returnBook(1L);

        assertEquals(new BigDecimal("25.00"), result.getFineAmount()); // 5 days × ₹5
        assertEquals(LoanStatus.RETURNED, result.getStatus());
    }

    @Test
    void shouldReturnZeroFineForOnTimeReturn() {
        Loan loan = new Loan();
        loan.setDueDate(LocalDate.now().plusDays(3));
        loan.setBook(new Book()); loan.getBook().setAvailableCopies(1);
        when(loanRepo.findById(1L)).thenReturn(Optional.of(loan));
        when(loanRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        LoanResponse result = loanService.returnBook(1L);

        assertEquals(BigDecimal.ZERO, result.getFineAmount());
    }
}
```

---

### 2.3 MemberServiceTest

```java
@Test
void shouldRegisterMemberSuccessfully() { ... }

@Test
void shouldThrowOnDuplicateEmail() { ... }

@Test
void shouldDeactivateMemberSuccessfully() { ... }
```

---

## 3. Integration Tests — Controller Layer

```java
@SpringBootTest
@AutoConfigureMockMvc
class BookControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    void setup() throws Exception {
        // Login and get token
        MvcResult result = mockMvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
            .andExpect(status().isOk())
            .andReturn();
        adminToken = JsonPath.read(result.getResponse().getContentAsString(), "$.token");
    }

    @Test
    void shouldGetAllBooks() throws Exception {
        mockMvc.perform(get("/api/books")
            .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void shouldAddBook() throws Exception {
        BookRequest req = new BookRequest("Test Book", "Test Author",
                                          "ISBN123456", "Fiction", 2, 2020);
        mockMvc.perform(post("/api/books")
            .header("Authorization", "Bearer " + adminToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Test Book"));
    }

    @Test
    void shouldReturn401WithoutToken() throws Exception {
        mockMvc.perform(get("/api/books"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn403ForMemberOnDelete() throws Exception {
        // login as member, try delete
        ...
        mockMvc.perform(delete("/api/books/1")
            .header("Authorization", "Bearer " + memberToken))
            .andExpect(status().isForbidden());
    }
}
```

---

## 4. Postman — API Test Checklist

### Auth
- [ ] POST `/auth/login` — valid credentials → 200 + token
- [ ] POST `/auth/login` — wrong password → 401
- [ ] POST `/auth/register` — as admin → 201
- [ ] POST `/auth/register` — as librarian → 403

### Books
- [ ] GET `/books` — with token → 200
- [ ] GET `/books` — no token → 401
- [ ] GET `/books?search=clean` → filtered results
- [ ] POST `/books` — valid → 201
- [ ] POST `/books` — duplicate ISBN → 409
- [ ] POST `/books` — missing fields → 400
- [ ] PUT `/books/1` → 200 updated
- [ ] DELETE `/books/1` — as admin → 200
- [ ] DELETE `/books/1` — as librarian → 403

### Members
- [ ] GET `/members` → 200
- [ ] POST `/members` — valid → 201
- [ ] POST `/members` — duplicate email → 409
- [ ] PUT `/members/1` → 200
- [ ] DELETE `/members/1` → 200

### Loans
- [ ] POST `/loans/issue` — valid → 201
- [ ] POST `/loans/issue` — no copies → 400
- [ ] POST `/loans/issue` — member overdue → 400
- [ ] PUT `/loans/return/1` — on time → fine = 0
- [ ] PUT `/loans/return/1` — 5 days late → fine = 25
- [ ] GET `/loans` → 200 list
- [ ] GET `/loans/overdue` → only overdue loans

### Dashboard
- [ ] GET `/dashboard/stats` → 200 with all 4 stats

---

## 5. Manual End-to-End Test Cases

| TC# | Scenario | Steps | Expected |
|-----|----------|-------|----------|
| E2E-01 | Full login flow | Open app → login → dashboard | Dashboard loads |
| E2E-02 | Add and search book | Add book → search by title | Book appears in results |
| E2E-03 | Issue and return flow | Issue book → verify copy count → return → verify fine | Fine correct |
| E2E-04 | Overdue loan | Issue book → manually backdate due_date → check overdue tab | Shows in overdue |
| E2E-05 | Role restriction | Login as MEMBER → try add book | Button not visible / 403 |
| E2E-06 | Member with overdue | Mark member overdue → try issue new book | Error shown |
| E2E-07 | Delete book with loan | Try delete book with active loan | Error shown |

---

## 6. Test Data Strategy

```sql
-- Insert test data before each test run
INSERT INTO books (title, author, isbn, category, total_copies, available_copies)
VALUES ('Test Book', 'Test Author', 'TEST-ISBN-001', 'Test', 2, 2);

INSERT INTO members (name, email, phone, status)
VALUES ('Test Member', 'test@test.com', '9999999999', 'ACTIVE');

-- Cleanup after tests
DELETE FROM loans WHERE member_id IN (SELECT id FROM members WHERE email = 'test@test.com');
DELETE FROM members WHERE email = 'test@test.com';
DELETE FROM books WHERE isbn = 'TEST-ISBN-001';
```
