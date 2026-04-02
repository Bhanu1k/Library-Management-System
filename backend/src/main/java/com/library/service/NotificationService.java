package com.library.service;

import com.library.model.*;
import com.library.model.Notification.DeliveryMethod;
import com.library.model.Notification.NotificationStatus;
import com.library.model.Notification.NotificationType;
import com.library.repository.NotificationPreferenceRepository;
import com.library.repository.NotificationRepository;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int MAX_RETRY_ATTEMPTS = 3;

    /**
     * Create a new notification
     */
    @Transactional
    public Notification createNotification(User user, NotificationType type, String title, 
                                          String message, DeliveryMethod deliveryMethod,
                                          Long referenceId, String referenceType) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .deliveryMethod(deliveryMethod)
                .status(NotificationStatus.PENDING)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .scheduledAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    /**
     * Send notification via configured delivery method
     */
    @Transactional
    public boolean sendNotification(Notification notification) {
        try {
            boolean sent = false;

            switch (notification.getDeliveryMethod()) {
                case EMAIL:
                    sent = sendEmailNotification(notification);
                    break;
                case SMS:
                    sent = sendSmsNotification(notification);
                    break;
                case IN_APP:
                    sent = true; // In-app notifications are already stored in DB
                    break;
            }

            if (sent) {
                notification.setStatus(NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
            } else {
                notification.setStatus(NotificationStatus.FAILED);
            }

            notificationRepository.save(notification);
            return sent;
        } catch (Exception e) {
            log.error("Failed to send notification: {}", notification.getId(), e);
            notification.setStatus(NotificationStatus.FAILED);
            notificationRepository.save(notification);
            return false;
        }
    }

    /**
     * Send email notification
     */
    private boolean sendEmailNotification(Notification notification) {
        User user = notification.getUser();
        // Note: In a real implementation, you'd fetch the member's email from the user's linked member profile
        // For now, we'll use a placeholder or the user's username as email
        String email = user.getUsername() + "@library.com"; // Placeholder
        
        switch (notification.getType()) {
            case DUE_DATE_REMINDER:
                return emailService.sendSimpleEmail(email, notification.getTitle(), notification.getMessage());
            case FINE_ALERT:
                return emailService.sendSimpleEmail(email, notification.getTitle(), notification.getMessage());
            case NEW_BOOK_ARRIVAL:
                return emailService.sendSimpleEmail(email, notification.getTitle(), notification.getMessage());
            default:
                return emailService.sendSimpleEmail(email, notification.getTitle(), notification.getMessage());
        }
    }

    /**
     * Send SMS notification
     */
    private boolean sendSmsNotification(Notification notification) {
        User user = notification.getUser();
        // Note: In a real implementation, you'd fetch the member's phone from the user's linked member profile
        // For now, we'll use a placeholder
        String phoneNumber = "+1234567890"; // Placeholder
        
        return smsService.sendSms(phoneNumber, notification.getMessage());
    }

    /**
     * Get user's notifications
     */
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get user's unread notifications
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findUnreadNotificationsByUserId(userId);
    }

    /**
     * Get unread notification count
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndStatusNot(userId, NotificationStatus.READ);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public Notification markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notification.setStatus(NotificationStatus.READ);
        notification.setReadAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findUnreadNotificationsByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        
        for (Notification notification : unreadNotifications) {
            notification.setStatus(NotificationStatus.READ);
            notification.setReadAt(now);
        }
        
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Get user's notification preferences
     */
    public NotificationPreference getUserPreferences(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
    }

    /**
     * Create default notification preferences for a user
     */
    @Transactional
    public NotificationPreference createDefaultPreferences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        NotificationPreference preference = NotificationPreference.builder()
                .user(user)
                .dueDateReminderEnabled(true)
                .dueDateReminderDaysBefore(3)
                .fineAlertEnabled(true)
                .newBookArrivalEnabled(true)
                .deliveryMethodInApp(true)
                .deliveryMethodEmail(true)
                .deliveryMethodSms(false)
                .notificationFrequency(NotificationPreference.NotificationFrequency.IMMEDIATE)
                .build();

        return preferenceRepository.save(preference);
    }

    /**
     * Update user's notification preferences
     */
    @Transactional
    public NotificationPreference updatePreferences(Long userId, NotificationPreference updatedPreferences) {
        NotificationPreference existing = getUserPreferences(userId);
        
        existing.setDueDateReminderEnabled(updatedPreferences.getDueDateReminderEnabled());
        existing.setDueDateReminderDaysBefore(updatedPreferences.getDueDateReminderDaysBefore());
        existing.setFineAlertEnabled(updatedPreferences.getFineAlertEnabled());
        existing.setNewBookArrivalEnabled(updatedPreferences.getNewBookArrivalEnabled());
        existing.setPreferredCategories(updatedPreferences.getPreferredCategories());
        existing.setDeliveryMethodInApp(updatedPreferences.getDeliveryMethodInApp());
        existing.setDeliveryMethodEmail(updatedPreferences.getDeliveryMethodEmail());
        existing.setDeliveryMethodSms(updatedPreferences.getDeliveryMethodSms());
        existing.setNotificationFrequency(updatedPreferences.getNotificationFrequency());
        existing.setQuietHoursStart(updatedPreferences.getQuietHoursStart());
        existing.setQuietHoursEnd(updatedPreferences.getQuietHoursEnd());

        return preferenceRepository.save(existing);
    }

    /**
     * Send due date reminder notification
     */
    @Transactional
    public void sendDueDateReminder(User user, Loan loan, int daysRemaining) {
        NotificationPreference preferences = getUserPreferences(user.getId());
        
        if (!preferences.getDueDateReminderEnabled()) {
            log.debug("Due date reminder disabled for user: {}", user.getUsername());
            return;
        }

        String title = "Book Due Soon";
        String message = String.format(
            "Your book '%s' is due in %d days. Due date: %s",
            loan.getBook().getTitle(),
            daysRemaining,
            loan.getDueDate().format(DATE_FORMATTER)
        );

        // Send via each enabled delivery method
        if (preferences.getDeliveryMethodInApp()) {
            createNotification(user, NotificationType.DUE_DATE_REMINDER, title, message,
                    DeliveryMethod.IN_APP, loan.getId(), "LOAN");
        }

        if (preferences.getDeliveryMethodEmail()) {
            Notification notification = createNotification(user, NotificationType.DUE_DATE_REMINDER, title, message,
                    DeliveryMethod.EMAIL, loan.getId(), "LOAN");
            sendNotification(notification);
        }

        if (preferences.getDeliveryMethodSms()) {
            Notification notification = createNotification(user, NotificationType.DUE_DATE_REMINDER, title, message,
                    DeliveryMethod.SMS, loan.getId(), "LOAN");
            sendNotification(notification);
        }
    }

    /**
     * Send fine alert notification
     */
    @Transactional
    public void sendFineAlert(User user, Loan loan, int daysOverdue, double fineAmount) {
        NotificationPreference preferences = getUserPreferences(user.getId());
        
        if (!preferences.getFineAlertEnabled()) {
            log.debug("Fine alert disabled for user: {}", user.getUsername());
            return;
        }

        String title = "Fine Notice";
        String message = String.format(
            "You have a \u20B9%.2f fine for '%s' (%d days overdue). Please return the book and pay the fine.",
            fineAmount,
            loan.getBook().getTitle(),
            daysOverdue
        );

        // Send via each enabled delivery method
        if (preferences.getDeliveryMethodInApp()) {
            createNotification(user, NotificationType.FINE_ALERT, title, message,
                    DeliveryMethod.IN_APP, loan.getId(), "LOAN");
        }

        if (preferences.getDeliveryMethodEmail()) {
            Notification notification = createNotification(user, NotificationType.FINE_ALERT, title, message,
                    DeliveryMethod.EMAIL, loan.getId(), "LOAN");
            sendNotification(notification);
        }

        if (preferences.getDeliveryMethodSms()) {
            Notification notification = createNotification(user, NotificationType.FINE_ALERT, title, message,
                    DeliveryMethod.SMS, loan.getId(), "LOAN");
            sendNotification(notification);
        }
    }

    /**
     * Send new book arrival notification
     */
    @Transactional
    public void sendNewBookArrival(User user, Book book) {
        NotificationPreference preferences = getUserPreferences(user.getId());
        
        if (!preferences.getNewBookArrivalEnabled()) {
            log.debug("New book arrival notification disabled for user: {}", user.getUsername());
            return;
        }

        // Check if user is interested in this book's category
        if (preferences.getPreferredCategories() != null && !preferences.getPreferredCategories().isEmpty()) {
            String[] preferredCategories = preferences.getPreferredCategories().split(",");
            boolean categoryMatch = false;
            
            for (String category : preferredCategories) {
                if (book.getCategory() != null && 
                    book.getCategory().toLowerCase().contains(category.trim().toLowerCase())) {
                    categoryMatch = true;
                    break;
                }
            }
            
            if (!categoryMatch) {
                log.debug("Book category '{}' doesn't match user preferences for user: {}", 
                    book.getCategory(), user.getUsername());
                return;
            }
        }

        String title = "New Book Arrival";
        String message = String.format(
            "A new book '%s' by %s is now available in the %s category.",
            book.getTitle(),
            book.getAuthor(),
            book.getCategory() != null ? book.getCategory() : "General"
        );

        // Send via each enabled delivery method
        if (preferences.getDeliveryMethodInApp()) {
            createNotification(user, NotificationType.NEW_BOOK_ARRIVAL, title, message,
                    DeliveryMethod.IN_APP, book.getId(), "BOOK");
        }

        if (preferences.getDeliveryMethodEmail()) {
            Notification notification = createNotification(user, NotificationType.NEW_BOOK_ARRIVAL, title, message,
                    DeliveryMethod.EMAIL, book.getId(), "BOOK");
            sendNotification(notification);
        }

        if (preferences.getDeliveryMethodSms()) {
            Notification notification = createNotification(user, NotificationType.NEW_BOOK_ARRIVAL, title, message,
                    DeliveryMethod.SMS, book.getId(), "BOOK");
            sendNotification(notification);
        }
    }

    /**
     * Retry failed notifications
     */
    @Transactional
    public void retryFailedNotifications() {
        List<Notification> failedNotifications = notificationRepository
                .findFailedNotificationsToRetry(LocalDateTime.now().minusHours(1));

        for (Notification notification : failedNotifications) {
            sendNotification(notification);
        }
    }

    /**
     * Delete old notifications (older than 30 days)
     */
    @Transactional
    public void cleanupOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        notificationRepository.deleteByCreatedAtBefore(cutoffDate);
        log.info("Cleaned up notifications older than: {}", cutoffDate);
    }
}
