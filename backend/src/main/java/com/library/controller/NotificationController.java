package com.library.controller;

import com.library.model.Notification;
import com.library.model.NotificationPreference;
import com.library.model.User;
import com.library.repository.UserRepository;
import com.library.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    /**
     * Get current user's notifications
     */
    @GetMapping
    public ResponseEntity<?> getNotifications(Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            List<Notification> notifications = notificationService.getUserNotifications(user.getId());
            long unreadCount = notificationService.getUnreadCount(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notifications);
            response.put("totalCount", notifications.size());
            response.put("unreadCount", unreadCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get unread notifications
     */
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            List<Notification> notifications = notificationService.getUnreadNotifications(user.getId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            long count = notificationService.getUnreadCount(user.getId());
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            Notification notification = notificationService.markAsRead(id, user.getId());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification marked as read",
                "notification", notification
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            notificationService.markAllAsRead(user.getId());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All notifications marked as read"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get user's notification preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            NotificationPreference preferences = notificationService.getUserPreferences(user.getId());
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update user's notification preferences
     */
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody NotificationPreference preferences,Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            NotificationPreference updated = notificationService.updatePreferences(user.getId(), preferences);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification preferences updated",
                "preferences", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Helper method to get user from authentication
     */
    private User getUserFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
