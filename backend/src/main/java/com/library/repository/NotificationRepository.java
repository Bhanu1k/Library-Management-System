package com.library.repository;

import com.library.model.Notification;
import com.library.model.Notification.NotificationStatus;
import com.library.model.Notification.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, NotificationStatus status);

    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.status = :status ORDER BY n.createdAt DESC")
    List<Notification> findUserNotificationsByStatus(@Param("userId") Long userId, @Param("status") NotificationStatus status);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") NotificationStatus status);

    long countByUserIdAndStatusNot(Long userId, NotificationStatus status);

    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' AND n.scheduledAt <= :now ORDER BY n.scheduledAt ASC")
    List<Notification> findPendingNotificationsToSend(@Param("now") LocalDateTime now);

    @Query("SELECT n FROM Notification n WHERE n.status = 'FAILED' AND n.scheduledAt <= :now ORDER BY n.scheduledAt ASC")
    List<Notification> findFailedNotificationsToRetry(@Param("now") LocalDateTime now);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.status != 'READ' ORDER BY n.createdAt DESC")
    List<Notification> findUnreadNotificationsByUserId(@Param("userId") Long userId);

    void deleteByUserIdAndStatus(Long userId, NotificationStatus status);

    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
}
