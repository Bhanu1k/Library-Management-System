package com.library.repository;

import com.library.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {

       Optional<Book> findByIsbn(String isbn);

       boolean existsByIsbn(String isbn);

       @Query("SELECT b FROM Book b WHERE " +
                     "LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :search, '%'))")
       Page<Book> searchBooks(@Param("search") String search, Pageable pageable);

       @Query("SELECT b FROM Book b WHERE " +
                     "(LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
                     "b.category = :category")
       Page<Book> searchBooksByCategory(@Param("search") String search,
                     @Param("category") String category,
                     Pageable pageable);

       Page<Book> findByCategory(String category, Pageable pageable);
}