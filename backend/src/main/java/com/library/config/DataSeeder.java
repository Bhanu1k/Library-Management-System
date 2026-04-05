package com.library.config;

import com.library.model.Book;
import com.library.model.Member;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.MemberRepository;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return; // Already seeded

        log.info("🌱 Seeding database with sample data...");

        // ── Users ──────────────────────────────────────────────
        // Admin user (not linked to a member)
        userRepository.save(User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator")
                .role(User.Role.ADMIN)
                .build());

        // Librarian user (not linked to a member)
        userRepository.save(User.builder()
                .username("librarian")
                .password(passwordEncoder.encode("lib123"))
                .fullName("Head Librarian")
                .role(User.Role.LIBRARIAN)
                .build());

        log.info("✅ Admin & Librarian users seeded");

        // ── Members ────────────────────────────────────────────
        // Seed members FIRST so we get their generated IDs
        Member m1 = memberRepository.save(Member.builder()
                .name("Rahul Sharma").email("rahul@example.com")
                .phone("9876543210").address("Mumbai, Maharashtra").build());
        Member m2 = memberRepository.save(Member.builder()
                .name("Priya Patel").email("priya@example.com")
                .phone("9876543211").address("Ahmedabad, Gujarat").build());
        memberRepository.save(Member.builder()
                .name("Amit Kumar").email("amit@example.com")
                .phone("9876543212").address("Delhi, NCR").build());
        memberRepository.save(Member.builder()
                .name("Sneha Reddy").email("sneha@example.com")
                .phone("9876543213").address("Hyderabad, Telangana").build());
        memberRepository.save(Member.builder()
                .name("Vikram Singh").email("vikram@example.com")
                .phone("9876543214").address("Jaipur, Rajasthan").build());

        log.info("✅ 5 members seeded");

        // ── Member user accounts (linked to member records) ───
        // FIX: Use setter to set memberId AFTER builder creates the object,
        //      because Lombok @Builder does NOT expose setters from explicit fields
        //      unless we call them separately. Here we just set memberId via setter.
        User memberUser1 = User.builder()
                .username("member")
                .password(passwordEncoder.encode("mem123"))
                .fullName(m1.getName())
                .email(m1.getEmail())
                .role(User.Role.MEMBER)
                .build();
        memberUser1.setMemberId(m1.getId());
        userRepository.save(memberUser1);

        User memberUser2 = User.builder()
                .username("priya")
                .password(passwordEncoder.encode("priya123"))
                .fullName(m2.getName())
                .email(m2.getEmail())
                .role(User.Role.MEMBER)
                .build();
        memberUser2.setMemberId(m2.getId());
        userRepository.save(memberUser2);

        log.info("✅ Member user accounts seeded (member/mem123, priya/priya123)");

        // ── Books ──────────────────────────────────────────────
        bookRepository.save(Book.builder().title("Clean Code").author("Robert C. Martin")
                .isbn("9780132350884").category("Technology").publishedYear(2008)
                .totalCopies(3).availableCopies(3)
                .description("A handbook of agile software craftsmanship.").build());
        bookRepository.save(Book.builder().title("The Pragmatic Programmer").author("David Thomas")
                .isbn("9780135957059").category("Technology").publishedYear(2019)
                .totalCopies(2).availableCopies(2)
                .description("Your journey to mastery.").build());
        bookRepository.save(Book.builder().title("Design Patterns").author("Gang of Four")
                .isbn("9780201633610").category("Technology").publishedYear(1994)
                .totalCopies(2).availableCopies(2)
                .description("Elements of reusable object-oriented software.").build());
        bookRepository.save(Book.builder().title("To Kill a Mockingbird").author("Harper Lee")
                .isbn("9780446310789").category("Fiction").publishedYear(1960)
                .totalCopies(4).availableCopies(4)
                .description("A classic of modern American literature.").build());
        bookRepository.save(Book.builder().title("1984").author("George Orwell")
                .isbn("9780451524935").category("Fiction").publishedYear(1949)
                .totalCopies(3).availableCopies(3)
                .description("A dystopian social science fiction novel.").build());
        bookRepository.save(Book.builder().title("Sapiens").author("Yuval Noah Harari")
                .isbn("9780062316097").category("History").publishedYear(2011)
                .totalCopies(2).availableCopies(2)
                .description("A brief history of humankind.").build());
        bookRepository.save(Book.builder().title("Atomic Habits").author("James Clear")
                .isbn("9780735211292").category("Self-Help").publishedYear(2018)
                .totalCopies(3).availableCopies(3)
                .description("Tiny changes, remarkable results.").build());
        bookRepository.save(Book.builder().title("The Alchemist").author("Paulo Coelho")
                .isbn("9780061122415").category("Fiction").publishedYear(1988)
                .totalCopies(2).availableCopies(2)
                .description("A novel about following your dreams.").build());
        bookRepository.save(Book.builder().title("Introduction to Algorithms").author("Cormen et al.")
                .isbn("9780262033848").category("Technology").publishedYear(2009)
                .totalCopies(2).availableCopies(2)
                .description("The definitive guide to algorithms.").build());
        bookRepository.save(Book.builder().title("The Great Gatsby").author("F. Scott Fitzgerald")
                .isbn("9780743273565").category("Fiction").publishedYear(1925)
                .totalCopies(3).availableCopies(3)
                .description("A story of the Jazz Age.").build());

        log.info("✅ 10 books seeded");
        log.info("🚀 Database seeding complete! Login: admin/admin123, librarian/lib123, member/mem123");
}
}
