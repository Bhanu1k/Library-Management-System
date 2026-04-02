package com.library.repository;

import com.library.model.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    Optional<NotificationPreference> findByUserId(Long userId);

    @Query("SELECT np FROM NotificationPreference np WHERE np.dueDateReminderEnabled = true")
    List<NotificationPreference> findAllWithDueDateReminderEnabled();

    @Query("SELECT np FROM NotificationPreference np WHERE np.fineAlertEnabled = true")
    List<NotificationPreference> findAllWithFineAlertEnabled();

    @Query("SELECT np FROM NotificationPreference np WHERE np.newBookArrivalEnabled = true")
    List<NotificationPreference> findAllWithNewBookArrivalEnabled();

    @Query("SELECT np FROM NotificationPreference np WHERE np.newBookArrivalEnabled = true AND np.preferredCategories LIKE %:category%")
    List<NotificationPreference> findByPreferredCategory(@Param("category") String category);

    boolean existsByUserId(Long userId);

    void deleteByUserId(Long userId);
}
