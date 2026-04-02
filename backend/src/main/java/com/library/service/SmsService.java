package com.library.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
@Slf4j
public class SmsService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromPhoneNumber;

    private boolean twilioEnabled = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isEmpty() && 
            authToken != null && !authToken.isEmpty()) {
            try {
                Twilio.init(accountSid, authToken);
                twilioEnabled = true;
                log.info("Twilio SMS service initialized successfully");
            } catch (Exception e) {
                log.warn("Failed to initialize Twilio SMS service: {}", e.getMessage());
                twilioEnabled = false;
            }
        } else {
            log.warn("Twilio credentials not configured. SMS service disabled.");
        }
    }

    /**
     * Send SMS message
     */
    public boolean sendSms(String toPhoneNumber, String message) {
        if (!twilioEnabled) {
            log.warn("SMS service is disabled. Cannot send SMS to: {}", toPhoneNumber);
            return false;
        }

        try {
            // Ensure phone number has country code
            String formattedNumber = formatPhoneNumber(toPhoneNumber);
            
            Message smsMessage = Message.creator(
                new PhoneNumber(formattedNumber),
                new PhoneNumber(fromPhoneNumber),
                message
            ).create();

            log.info("SMS sent successfully to: {}. SID: {}", toPhoneNumber, smsMessage.getSid());
            return true;
        } catch (Exception e) {
            log.error("Failed to send SMS to: {}", toPhoneNumber, e);
            return false;
        }
    }

    /**
     * Send due date reminder SMS
     */
    public boolean sendDueDateReminderSms(String toPhoneNumber, String bookTitle, 
                                          String dueDate, int daysRemaining) {
        String message = String.format(
            "Library Reminder: Your book \"%s\" is due in %d days. Please return it by %s.",
            bookTitle, daysRemaining, dueDate
        );
        return sendSms(toPhoneNumber, message);
    }

    /**
     * Send fine alert SMS
     */
    public boolean sendFineAlertSms(String toPhoneNumber, String bookTitle, 
                                    int daysOverdue, double fineAmount) {
        String message = String.format(
            "Library Fine Alert: You have a \u20B9%.2f fine for \"%s\" (%d days overdue). Please return and pay.",
            fineAmount, bookTitle, daysOverdue
        );
        return sendSms(toPhoneNumber, message);
    }

    /**
     * Send new book arrival SMS
     */
    public boolean sendNewBookArrivalSms(String toPhoneNumber, String bookTitle, 
                                         String bookAuthor, String bookCategory) {
        String message = String.format(
            "New Book: \"%s\" by %s is now available in %s. Visit the library to borrow!",
            bookTitle, bookAuthor, bookCategory
        );
        return sendSms(toPhoneNumber, message);
    }

    /**
     * Format phone number to include country code if missing
     */
    private String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return phoneNumber;
        }

        // Remove any spaces or special characters
        String cleaned = phoneNumber.replaceAll("[\\s\\-()]", "");

        // If number doesn't start with +, add +1 (US) as default
        // In production, you might want to handle different country codes
        if (!cleaned.startsWith("+")) {
            // Assume US number if no country code
            if (cleaned.length() == 10) {
                return "+1" + cleaned;
            } else if (cleaned.length() == 11 && cleaned.startsWith("1")) {
                return "+" + cleaned;
            }
        }

        return cleaned;
    }

    /**
     * Check if SMS service is enabled
     */
    public boolean isSmsEnabled() {
        return twilioEnabled;
    }
}
