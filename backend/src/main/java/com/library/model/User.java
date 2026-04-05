package com.library.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @Email
    @Column(unique = true, length = 150)
    private String email;

    @Column(length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.MEMBER;

    // Profile picture — stores relative path e.g. "uploads/avatars/user_1.jpg"
    @Column(length = 500)
    private String profilePicture;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    // Link to Member record (for MEMBER role users).
    // NOTE: This is a plain Long column — NOT a JPA relationship.
    // It stores the member's PK so we can look up the member when needed.
    // FIX: Renamed from memberId column to avoid Lombok builder conflict.
    //      The @Column annotation maps to the correct DB column "member_id".
    //      Lombok @Builder + @Setter generates setMemberId() correctly because
    //      the field name is memberId (camelCase) and Lombok does NOT generate
    //      a memberId(long) builder method when explicit getters/setters exist
    //      alongside @Builder — we removed the duplicate manual methods.
    @Column(name = "member_id")
    private Long memberId;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // NOTE: Do NOT declare getMemberId() / setMemberId() manually here.
    // @Getter + @Setter already generates them. Having both caused the
    // compile error "cannot find symbol: method memberId(long) in UserBuilder"
    // because Lombok's builder tries to create a builder method for the field,
    // but the presence of manual accessor methods confused the annotation
    // processor in some configurations.

    public enum Role {
        ADMIN, LIBRARIAN, MEMBER
    }
}
