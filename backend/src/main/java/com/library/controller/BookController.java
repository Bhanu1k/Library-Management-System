package com.library.controller;

import com.library.model.Book;
import com.library.repository.BookRepository;
import com.library.service.NotificationService;
import com.library.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookRepository bookRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // GET /api/books — list all (authenticated)
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookRepository.findAll());
    }

    // GET /api/books/{id} — get single book
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        return ResponseEntity.ok(book);
    }

    // POST /api/books — add book (ADMIN/LIBRARIAN)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Book> addBook(@Valid @RequestBody Book book) {
        if (bookRepository.existsByIsbn(book.getIsbn())) {
            throw new RuntimeException("A book with ISBN '" + book.getIsbn() + "' already exists.");
        }
        // availableCopies defaults to totalCopies if not set
        if (book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies() != null ? book.getTotalCopies() : 1);
        }
        Book saved = bookRepository.save(book);

        // Notify all users about new book arrival
        try {
            userRepository.findAll().forEach(user -> {
                try {
                    notificationService.sendNewBookArrival(user, saved);
                } catch (Exception ignored) {}
            });
        } catch (Exception ignored) {}

        return ResponseEntity.ok(saved);
    }

    // PUT /api/books/{id} — update book (ADMIN/LIBRARIAN)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setCategory(bookDetails.getCategory());
        book.setPublishedYear(bookDetails.getPublishedYear());
        book.setDescription(bookDetails.getDescription());

        // Update copies carefully — adjust availableCopies proportionally
        if (bookDetails.getTotalCopies() != null) {
            int diff = bookDetails.getTotalCopies() - book.getTotalCopies();
            book.setTotalCopies(bookDetails.getTotalCopies());
            int newAvailable = Math.max(0, book.getAvailableCopies() + diff);
            book.setAvailableCopies(newAvailable);
        }

        return ResponseEntity.ok(bookRepository.save(book));
    }

    // DELETE /api/books/{id} — delete book (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        bookRepository.delete(book);
        return ResponseEntity.ok(Map.of("message", "Book deleted successfully."));
    }
}
