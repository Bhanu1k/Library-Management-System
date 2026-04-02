package com.library.service;

import com.library.model.Loan;
import com.library.model.Member;
import com.library.model.User;
import com.library.repository.LoanRepository;
import com.library.repository.MemberRepository;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final NotificationService notificationService;
    private final LoanRepository loanRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;

    /**
     * Send due date reminders daily at 8:00 AM
     * Checks for loans due within the next 1-7 days based on user preferences
     */
    @Scheduled(cron = "${notification.scheduler.due-date-reminder-cron:0 0 8 * * ?}")
    public void sendDueDateReminders() {
        log.info("Starting due date reminder scheduler");
        
        try {
            LocalDate today = LocalDate.now();
            LocalDate maxDate = today.plusDays(7); // Check up to 7 days ahead
            
            List<Loan> activeLoans = loanRepository.findActiveLoansDueBetween(today, maxDate);
            
            for (Loan loan : activeLoans) {
                try {
                    LocalDate dueDate = loan.getDueDate();
                    long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);
                    
                    // Only send reminder if due date is within 1-7 days
                    if (daysUntilDue > 0 && daysUntilDue <= 7) {
                        Member member = loan.getMember();
                        User user = findUserByMemberId(member.getId());
                        
                        if (user != null) {
                            notificationService.sendDueDateReminder(user, loan, (int) daysUntilDue);
                            log.debug("Sent due date reminder for loan: {}, member: {}", 
                                loan.getId(), member.getName());
                        }
                    }
                } catch (Exception e) {
                    log.error("Error sending due date reminder for loan: {}", loan.getId(), e);
                }
            }
            
            log.info("Completed due date reminder scheduler");
        } catch (Exception e) {
            log.error("Error in due date reminder scheduler", e);
        }
    }

    /**
     * Send fine alerts daily at 9:00 AM
     * Checks for overdue loans with accumulated fines
     */
    @Scheduled(cron = "${notification.scheduler.fine-alert-cron:0 0 9 * * ?}")
    public void sendFineAlerts() {
        log.info("Starting fine alert scheduler");
        
        try {
            LocalDate today = LocalDate.now();
            List<Loan> overdueLoans = loanRepository.findOverdueLoans(today);
            
            for (Loan loan : overdueLoans) {
                try {
                    LocalDate dueDate = loan.getDueDate();
                    long daysOverdue = ChronoUnit.DAYS.between(dueDate, today);
                    
                    // Calculate fine amount
                    double finePerDay = 5.0;
                    double maxFine = 500.0;
                    double fineAmount = Math.min(daysOverdue * finePerDay, maxFine);
                    
                    Member member = loan.getMember();
                    User user = findUserByMemberId(member.getId());
                    
                    if (user != null) {
                        notificationService.sendFineAlert(user, loan, (int) daysOverdue, fineAmount);
                        log.debug("Sent fine alert for loan: {}, member: {}, fine: ${}", 
                            loan.getId(), member.getName(), fineAmount);
                    }
                } catch (Exception e) {
                    log.error("Error sending fine alert for loan: {}", loan.getId(), e);
                }
            }
            
            log.info("Completed fine alert scheduler");
        } catch (Exception e) {
            log.error("Error in fine alert scheduler", e);
        }
    }

    /**
     * Retry failed notifications every hour
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void retryFailedNotifications() {
        log.info("Starting failed notification retry scheduler");
        
        try {
            notificationService.retryFailedNotifications();
            log.info("Completed failed notification retry scheduler");
        } catch (Exception e) {
            log.error("Error in failed notification retry scheduler", e);
        }
    }

    /**
     * Clean up old notifications weekly (Sunday at 2:00 AM)
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    public void cleanupOldNotifications() {
        log.info("Starting notification cleanup scheduler");
        
        try {
            notificationService.cleanupOldNotifications();
            log.info("Completed notification cleanup scheduler");
        } catch (Exception e) {
            log.error("Error in notification cleanup scheduler", e);
        }
    }

    /**
     * Helper method to find user by member ID
     */
    private User findUserByMemberId(Long memberId) {
        return userRepository.findByMemberId(memberId).orElse(null);
    }
}
