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
                if (userRepository.count() > 0)
                        return; // Already seeded

                log.info("Seeding database with sample data...");

                // ── Books ──
                bookRepository.save(Book.builder().title("Clean Code").author("Robert C. Martin").isbn("9780132350884")
                                .category("Technology").publishedYear(2008).totalCopies(3).availableCopies(3)
                                .description("A handbook of agile software craftsmanship.").build());
                bookRepository.save(Book.builder().title("The Pragmatic Programmer").author("David Thomas")
                                .isbn("9780135957059").category("Technology").publishedYear(2019).totalCopies(2)
                                .availableCopies(2).description("Your journey to mastery.").build());
                bookRepository.save(Book.builder().title("Design Patterns").author("Gang of Four").isbn("9780201633610")
                                .category("Technology").publishedYear(1994).totalCopies(2).availableCopies(2)
                                .description("Elements of reusable object-oriented software.").build());
                bookRepository.save(Book.builder().title("To Kill a Mockingbird").author("Harper Lee")
                                .isbn("9780446310789").category("Fiction").publishedYear(1960).totalCopies(4)
                                .availableCopies(4).description("A classic of modern American literature.").build());
                bookRepository.save(Book.builder().title("1984").author("George Orwell").isbn("9780451524935")
                                .category("Fiction").publishedYear(1949).totalCopies(3).availableCopies(3)
                                .description("A dystopian social science fiction novel.").build());
                bookRepository.save(Book.builder().title("Sapiens").author("Yuval Noah Harari").isbn("9780062316097")
                                .category("History").publishedYear(2011).totalCopies(2).availableCopies(2)
                                .description("A brief history of humankind.").build());
                bookRepository.save(Book.builder().title("Atomic Habits").author("James Clear").isbn("9780735211292")
                                .category("Self-Help").publishedYear(2018).totalCopies(3).availableCopies(3)
                                .description("Tiny changes, remarkable results.").build());
                bookRepository.save(Book.builder().title("The Alchemist").author("Paulo Coelho").isbn("9780061122415")
                                .category("Fiction").publishedYear(1988).totalCopies(2).availableCopies(2)
                                .description("A novel about following your dreams.").build());
                log.info("8 books seeded");

                // ── Members (saved first to capture auto-generated IDs) ──
                Member m1 = memberRepository.save(Member.builder().name("Rahul Sharma").email("rahul@example.com")
                                .phone("9876543210").address("Mumbai, Maharashtra").build());
                Member m2 = memberRepository.save(Member.builder().name("Priya Patel").email("priya@example.com")
                                .phone("9876543211").address("Ahmedabad, Gujarat").build());
                Member m3 = memberRepository.save(Member.builder().name("Amit Kumar").email("amit@example.com")
                                .phone("9876543212").address("Delhi, NCR").build());
                Member m4 = memberRepository.save(Member.builder().name("Sneha Reddy").email("sneha@example.com")
                                .phone("9876543213").address("Hyderabad, Telangana").build());
                Member m5 = memberRepository.save(Member.builder().name("Vikram Singh").email("vikram@example.com")
                                .phone("9876543214").address("Jaipur, Rajasthan").build());
                log.info("5 members seeded");

                // ── Users (use captured member IDs) ──
                userRepository.save(User.builder()
                                .username("admin")
                                .password(passwordEncoder.encode("admin123"))
                                .role(User.Role.ADMIN)
                                .build());

                userRepository.save(User.builder()
                                .username("librarian")
                                .password(passwordEncoder.encode("lib123"))
                                .role(User.Role.LIBRARIAN)
                                .build());

                userRepository.save(User.builder()
                                .username("member")
                                .password(passwordEncoder.encode("mem123"))
                                .role(User.Role.MEMBER)
                                .memberId(m1.getId())
                                .build());

                log.info("Users seeded (admin/admin123, librarian/lib123, member/mem123)");
                log.info("Database seeding complete!");
        }
}
