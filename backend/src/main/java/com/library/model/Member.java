package com.library.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 300)
    private String address;

    @Column(nullable = false)
    @Builder.Default
    private LocalDate joinedDate = LocalDate.now();

    // Membership expiry — set to 1 year from joinedDate by default
    @Column
    private LocalDate expiryDate;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @PostLoad
    @PrePersist
    public void autoSetExpiry() {
        if (expiryDate == null && joinedDate != null) {
            expiryDate = joinedDate.plusYears(1);
        }
    }
}