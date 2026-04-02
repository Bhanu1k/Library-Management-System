package com.library.controller;

import com.library.model.Book;
import com.library.service.BookSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/books/search")
@RequiredArgsConstructor
public class BookSearchController {

        private final BookSearchService bookSearchService;

        @GetMapping
        public ResponseEntity<?> advancedSearch(
                        @RequestParam(required = false) String query,
                        @RequestParam(required = false) String title,
                        @RequestParam(required = false) String author,
                        @RequestParam(required = false) String isbn,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) Integer yearFrom,
                        @RequestParam(required = false) Integer yearTo,
                        @RequestParam(required = false) Boolean availableOnly,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(defaultValue = "title") String sortBy,
                        @RequestParam(defaultValue = "asc") String sortDir) {

                String normalizedSortBy = normalizeSortBy(sortBy);

                Sort sort = sortDir.equalsIgnoreCase("desc")
                                ? Sort.by(normalizedSortBy).descending()
                                : Sort.by(normalizedSortBy).ascending();

                Page<Book> result = bookSearchService.advancedSearch(
                                query, title, author, isbn, category,
                                yearFrom, yearTo, availableOnly,
                                PageRequest.of(page, size, sort));

                Map<String, Object> response = new HashMap<>();
                response.put("content", result.getContent());
                response.put("currentPage", result.getNumber());
                response.put("totalPages", result.getTotalPages());
                response.put("totalElements", result.getTotalElements());
                return ResponseEntity.ok(response);
        }

        private String normalizeSortBy(String sortBy) {
                if (sortBy == null || sortBy.isBlank()) {
                        return "title";
                }

                return switch (sortBy) {
                        case "title", "author", "isbn", "category", "publishedYear", "availableCopies", "totalCopies" -> sortBy;
                        default -> "title";
                };
        }
}
