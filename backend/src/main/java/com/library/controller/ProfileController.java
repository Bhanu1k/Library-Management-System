package com.library.controller;

import com.library.model.User;
import com.library.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // ── Get current user's profile ────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        User user = profileService.getUserByUsername(auth.getName());
        return ResponseEntity.ok(profileService.toProfileResponse(user));
    }

    // ── Update current user's profile ─────────────────────────
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        User user = profileService.updateProfile(auth.getName(), body);
        return ResponseEntity.ok(Map.of(
            "message", "Profile updated successfully.",
            "user", profileService.toProfileResponse(user)
        ));
    }

    // ── Upload profile picture ─────────────────────────────────
    @PostMapping("/me/picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        String picturePath = profileService.uploadProfilePicture(auth.getName(), file);
        return ResponseEntity.ok(Map.of(
            "message", "Profile picture updated successfully.",
            "profilePicture", picturePath
        ));
    }

    // ── Delete profile picture ─────────────────────────────────
    @DeleteMapping("/me/picture")
    public ResponseEntity<?> deleteProfilePicture(Authentication auth) {
        profileService.deleteProfilePicture(auth.getName());
        return ResponseEntity.ok(Map.of("message", "Profile picture removed."));
    }

    // ── Change password ────────────────────────────────────────
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        profileService.changePassword(
            auth.getName(),
            body.get("currentPassword"),
            body.get("newPassword")
        );
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    // ── Admin: get all users ───────────────────────────────────
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<?>> getAllUsers() {
        return ResponseEntity.ok(profileService.getAllUsersResponse());
    }

    // ── Admin: get user by id ──────────────────────────────────
    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(profileService.toProfileResponse(profileService.getUserById(id)));
    }

    // ── Admin: update any user's role ──────────────────────────
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = profileService.updateUserRole(id, body.get("role"));
        return ResponseEntity.ok(Map.of(
            "message", "User role updated.",
            "user", profileService.toProfileResponse(user)
        ));
    }

    // ── Admin: activate / deactivate user ─────────────────────
    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        User user = profileService.updateUserStatus(id, body.get("active"));
        return ResponseEntity.ok(Map.of(
            "message", "User status updated.",
            "user", profileService.toProfileResponse(user)
        ));
    }

    // ── Admin: upload picture for any user ────────────────────
    @PostMapping("/users/{id}/picture")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadUserPicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        User user = profileService.getUserById(id);
        String path = profileService.uploadProfilePicture(user.getUsername(), file);
        return ResponseEntity.ok(Map.of("profilePicture", path));
    }
}