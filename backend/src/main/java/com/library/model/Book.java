package com.library.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String author;

    @NotBlank
    @Column(nullable = false, unique = true, length = 20)
    private String isbn;

    @Column(length = 100)
    private String category;

    private Integer publishedYear;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalCopies = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer availableCopies = 1;

    @Column(length = 500)
    private String description;
}
