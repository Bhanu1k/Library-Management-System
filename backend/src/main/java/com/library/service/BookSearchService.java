package com.library.service;

import com.library.model.Book;
import com.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookSearchService {

    private final BookRepository bookRepository;

    public Page<Book> advancedSearch(
            String query,
            String title, String author, String isbn,
            String category,
            Integer yearFrom, Integer yearTo,
            Boolean availableOnly, Pageable pageable) {

        Specification<Book> spec = (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hasText(query)) {
                String pattern = "%" + query.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("author")), pattern),
                        cb.like(cb.lower(root.get("isbn")), pattern)));
            }

            if (hasText(title))
                predicates.add(cb.like(cb.lower(root.get("title")),
                        "%" + title.toLowerCase() + "%"));

            if (hasText(author))
                predicates.add(cb.like(cb.lower(root.get("author")),
                        "%" + author.toLowerCase() + "%"));

            if (hasText(isbn))
                predicates.add(cb.like(cb.lower(root.get("isbn")),
                        "%" + isbn.toLowerCase() + "%"));

            if (hasText(category))
                predicates.add(cb.equal(cb.lower(root.get("category")),
                        category.toLowerCase()));

            if (yearFrom != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("publishedYear"), yearFrom));

            if (yearTo != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("publishedYear"), yearTo));

            if (Boolean.TRUE.equals(availableOnly))
                predicates.add(cb.greaterThan(root.get("availableCopies"), 0));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return bookRepository.findAll(spec, pageable);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
