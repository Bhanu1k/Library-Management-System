# Comprehensive Notifications System - Implementation Plan

## Overview
This document outlines the implementation plan for a comprehensive notifications system for the Library Management System. The system will support due date reminders, fine alerts, and new book arrival notifications with multiple delivery methods (in-app, email, SMS).

## System Architecture

### 1. Database Schema Design

#### Notification Table
```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- DUE_DATE_REMINDER, FINE_ALERT, NEW_BOOK_ARRIVAL
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    delivery_method VARCHAR(20) NOT NULL, -- IN_APP, EMAIL, SMS
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED, READ
    reference_id BIGINT, -- ID of related entity (loan_id, book_id)
    reference_type VARCHAR(50), -- LOAN, BOOK
    scheduled_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
```

#### Notification Preference Table
```sql
CREATE TABLE notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) UNIQUE,
    due_date_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    due_date_reminder_days_before INT NOT NULL DEFAULT 3,
    fine_alert_enabled BOOLEAN NOT NULL DEFAULT true,
    new_book_arrival_enabled BOOLEAN NOT NULL DEFAULT true,
    preferred_categories TEXT, -- Comma-separated list of book categories
    delivery_method_in_app BOOLEAN NOT NULL DEFAULT true,
    delivery_method_email BOOLEAN NOT NULL DEFAULT true,
    delivery_method_sms BOOLEAN NOT NULL DEFAULT false,
    notification_frequency VARCHAR(20) NOT NULL DEFAULT 'IMMEDIATE', -- IMMEDIATE, DAILY, WEEKLY
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

### 2. Backend Components

#### 2.1 Model Entities
- `Notification.java` - JPA entity for notifications
- `NotificationPreference.java` - JPA entity for user preferences

#### 2.2 Repositories
- `NotificationRepository.java` - Data access for notifications
- `NotificationPreferenceRepository.java` - Data access for preferences

#### 2.3 Services
- `NotificationService.java` - Core business logic for notifications
- `EmailService.java` - Email delivery service
- `SmsService.java` - SMS delivery service
- `NotificationScheduler.java` - Scheduled tasks for automated notifications

#### 2.4 Controllers
- `NotificationController.java` - REST API endpoints for notifications

#### 2.5 DTOs
- `NotificationDto.java` - Data transfer object for notifications
- `NotificationPreferenceDto.java` - Data transfer object for preferences
- `UpdatePreferenceRequest.java` - Request DTO for updating preferences

### 3. Frontend Components

#### 3.1 Profile Page Updates
- Add notification preferences section to profile.html
- Allow users to configure:
  - Enable/disable each notification type
  - Set due date reminder days (1-7 days)
  - Select preferred book categories
  - Choose delivery methods
  - Set notification frequency
  - Configure quiet hours

#### 3.2 Notifications Display
- Add notifications bell icon to header
- Create notifications dropdown/panel
- Show unread notification count
- Mark notifications as read
- Filter notifications by type

### 4. Scheduled Tasks

#### 4.1 Due Date Reminders
- Run daily at 8:00 AM
- Check loans due within configured days
- Send reminders via configured delivery methods

#### 4.2 Fine Alerts
- Run daily at 9:00 AM
- Check overdue loans with fines
- Send fine alerts to affected members

#### 4.3 New Book Arrivals
- Run when new books are added
- Match book categories with user preferences
- Send notifications to interested users

### 5. Delivery Methods

#### 5.1 In-App Notifications
- Store in database
- Display in UI
- Real-time updates (optional: WebSocket)

#### 5.2 Email Notifications
- Use Spring Mail with SMTP
- HTML email templates
- Support for Gmail, Outlook, etc.

#### 5.3 SMS Notifications
- Use Twilio API
- Text message templates
- International support

### 6. Configuration

#### 6.1 Application Properties
```properties
# Email Configuration
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# SMS Configuration (Twilio)
twilio.account.sid=${TWILIO_ACCOUNT_SID:}
twilio.auth.token=${TWILIO_AUTH_TOKEN:}
twilio.phone.number=${TWILIO_PHONE_NUMBER:}

# Notification Settings
notification.due-date-reminder.enabled=true
notification.fine-alert.enabled=true
notification.new-book-arrival.enabled=true
notification.scheduler.enabled=true
```

### 7. Security Considerations

#### 7.1 API Endpoints
- `GET /api/notifications` - Get user's notifications (authenticated)
- `PUT /api/notifications/{id}/read` - Mark notification as read (authenticated)
- `GET /api/notifications/preferences` - Get user preferences (authenticated)
- `PUT /api/notifications/preferences` - Update user preferences (authenticated)
- `GET /api/notifications/unread-count` - Get unread count (authenticated)
- `POST /api/notifications/test` - Send test notification (admin only)

#### 7.2 Authorization
- Users can only access their own notifications
- Users can only modify their own preferences
- Admins can send test notifications
- Scheduled tasks run with system privileges

### 8. Error Handling

#### 8.1 Retry Logic
- Failed email/SMS attempts retry up to 3 times
- Exponential backoff between retries
- Log failures for manual review

#### 8.2 Fallback Mechanisms
- If email fails, try in-app notification
- If SMS fails, try email
- Always create in-app notification as backup

### 9. Testing Strategy

#### 9.1 Unit Tests
- Test notification service logic
- Test email/SMS service mocks
- Test scheduler logic

#### 9.2 Integration Tests
- Test API endpoints
- Test database operations
- Test scheduled tasks

#### 9.3 Manual Testing
- Test email delivery
- Test SMS delivery (if configured)
- Test UI interactions

### 10. Implementation Order

1. **Phase 1: Core Infrastructure**
   - Create database models
   - Create repositories
   - Add dependencies
   - Configure properties

2. **Phase 2: Backend Services**
   - Implement NotificationService
   - Implement EmailService
   - Implement SmsService
   - Create API endpoints

3. **Phase 3: Scheduled Tasks**
   - Implement due date reminders
   - Implement fine alerts
   - Implement new book arrivals

4. **Phase 4: Frontend**
   - Update profile page with preferences
   - Create notifications UI
   - Add JavaScript functionality

5. **Phase 5: Testing & Refinement**
   - Test all notification types
   - Test all delivery methods
   - Refine based on feedback

## API Specifications

### Get Notifications
```
GET /api/notifications
Authorization: Bearer {token}

Response:
{
  "notifications": [
    {
      "id": 1,
      "type": "DUE_DATE_REMINDER",
      "title": "Book Due Soon",
      "message": "Your book 'Java Programming' is due in 2 days",
      "status": "UNREAD",
      "createdAt": "2024-03-30T10:00:00"
    }
  ],
  "totalCount": 10,
  "unreadCount": 3
}
```

### Update Preferences
```
PUT /api/notifications/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "dueDateReminderEnabled": true,
  "dueDateReminderDaysBefore": 3,
  "fineAlertEnabled": true,
  "newBookArrivalEnabled": true,
  "preferredCategories": "Fiction,Science,Technology",
  "deliveryMethodInApp": true,
  "deliveryMethodEmail": true,
  "deliveryMethodSms": false,
  "notificationFrequency": "IMMEDIATE"
}
```

### Mark as Read
```
PUT /api/notifications/{id}/read
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Email Templates

### Due Date Reminder
```
Subject: Reminder: Book Due Soon - Library Management System

Dear {memberName},

This is a friendly reminder that the following book is due soon:

Book: {bookTitle}
Author: {bookAuthor}
Due Date: {dueDate}
Days Remaining: {daysRemaining}

Please return the book by the due date to avoid fines.

Best regards,
Library Management System
```

### Fine Alert
```
Subject: Fine Notice - Library Management System

Dear {memberName},

You have an overdue book with accumulated fines:

Book: {bookTitle}
Author: {bookAuthor}
Due Date: {dueDate}
Days Overdue: {daysOverdue}
Fine Amount: ${fineAmount}

Please return the book and pay the fine at your earliest convenience.

Best regards,
Library Management System
```

### New Book Arrival
```
Subject: New Book Arrival - Library Management System

Dear {memberName},

A new book matching your interests has arrived:

Book: {bookTitle}
Author: {bookAuthor}
Category: {bookCategory}
Description: {bookDescription}

Visit our library to borrow this book!

Best regards,
Library Management System
```

## SMS Templates

### Due Date Reminder
```
Library Reminder: Your book "{bookTitle}" is due in {daysRemaining} days. Please return it by {dueDate}.
```

### Fine Alert
```
Library Fine Alert: You have a ${fineAmount} fine for "{bookTitle}" ({daysOverdue} days overdue). Please return and pay.
```

### New Book Arrival
```
New Book: "{bookTitle}" by {bookAuthor} is now available in {bookCategory}. Visit the library to borrow!
```

## Dependencies to Add

```xml
<!-- Spring Mail -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- Twilio for SMS -->
<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>9.14.1</version>
</dependency>

<!-- Thymeleaf for email templates -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

## File Structure

```
backend/src/main/java/com/library/
├── model/
│   ├── Notification.java
│   └── NotificationPreference.java
├── repository/
│   ├── NotificationRepository.java
│   └── NotificationPreferenceRepository.java
├── service/
│   ├── NotificationService.java
│   ├── EmailService.java
│   ├── SmsService.java
│   └── NotificationScheduler.java
├── controller/
│   └── NotificationController.java
├── dto/
│   ├── NotificationDto.java
│   ├── NotificationPreferenceDto.java
│   └── UpdatePreferenceRequest.java
└── config/
    └── NotificationConfig.java

backend/src/main/resources/
├── templates/
│   ├── email/
│   │   ├── due-date-reminder.html
│   │   ├── fine-alert.html
│   │   └── new-book-arrival.html
│   └── application.properties (updated)

frontend/
├── profile.html (updated)
├── notifications.html (new)
├── js/
│   └── notifications.js (new)
└── css/
    └── notifications.css (new)
```

## Success Criteria

1. ✅ Users receive due date reminders 1-7 days before due date (configurable)
2. ✅ Users receive fine alerts for overdue books
3. ✅ Users receive new book arrival notifications based on preferences
4. ✅ Users can choose delivery methods (in-app, email, SMS)
5. ✅ Users can customize notification frequency
6. ✅ Users can set quiet hours
7. ✅ Notifications are stored and displayed in the UI
8. ✅ Users can mark notifications as read
9. ✅ System handles delivery failures gracefully
10. ✅ All notification types work correctly

## Notes

- SMS functionality requires Twilio account and credentials
- Email functionality requires SMTP server configuration
- For development, use H2 database with auto-create
- For production, use PostgreSQL with proper migrations
- Consider adding WebSocket for real-time notifications (future enhancement)
- Consider adding push notifications for mobile (future enhancement)
