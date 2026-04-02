package com.library.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "due_date_reminder_enabled", nullable = false)
    @Builder.Default
    private Boolean dueDateReminderEnabled = true;

    @Column(name = "due_date_reminder_days_before", nullable = false)
    @Builder.Default
    private Integer dueDateReminderDaysBefore = 3;

    @Column(name = "fine_alert_enabled", nullable = false)
    @Builder.Default
    private Boolean fineAlertEnabled = true;

    @Column(name = "new_book_arrival_enabled", nullable = false)
    @Builder.Default
    private Boolean newBookArrivalEnabled = true;

    @Column(name = "preferred_categories", length = 500)
    private String preferredCategories;

    @Column(name = "delivery_method_in_app", nullable = false)
    @Builder.Default
    private Boolean deliveryMethodInApp = true;

    @Column(name = "delivery_method_email", nullable = false)
    @Builder.Default
    private Boolean deliveryMethodEmail = true;

    @Column(name = "delivery_method_sms", nullable = false)
    @Builder.Default
    private Boolean deliveryMethodSms = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_frequency", nullable = false, length = 20)
    @Builder.Default
    private NotificationFrequency notificationFrequency = NotificationFrequency.IMMEDIATE;

    @Column(name = "quiet_hours_start")
    private LocalTime quietHoursStart;

    @Column(name = "quiet_hours_end")
    private LocalTime quietHoursEnd;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum NotificationFrequency {
        IMMEDIATE,
        DAILY,
        WEEKLY
    }
}
