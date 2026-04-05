package com.library.controller;

import com.library.service.ProfileService;
import com.library.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * UserController — handles /api/users endpoints.
 *
 * The frontend users.js calls:
 *   GET    /api/users          — list all users (ADMIN)
 *   PUT    /api/users/{id}/role   — change role (ADMIN)
 *   PUT    /api/users/{id}/status — activate/deactivate (ADMIN)
 *
 * These mirror the existing /api/profile/users/* endpoints but at a
 * shorter path that the frontend users.js module uses.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final ProfileService profileService;

    // GET /api/users — list all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<?>> getAllUsers() {
        return ResponseEntity.ok(profileService.getAllUsersResponse());
    }

    // GET /api/users/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(profileService.toProfileResponse(profileService.getUserById(id)));
    }

    // PUT /api/users/{id}/role — change role
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = profileService.updateUserRole(id, body.get("role"));
        return ResponseEntity.ok(Map.of(
            "message", "Role updated to " + user.getRole().name() + ".",
            "user", profileService.toProfileResponse(user)
        ));
    }

    // PUT /api/users/{id}/status — activate/deactivate
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        User user = profileService.updateUserStatus(id, body.get("active"));
        return ResponseEntity.ok(Map.of(
            "message", "User " + (Boolean.TRUE.equals(user.getActive()) ? "activated" : "deactivated") + ".",
            "user", profileService.toProfileResponse(user)
        ));
    }
}
