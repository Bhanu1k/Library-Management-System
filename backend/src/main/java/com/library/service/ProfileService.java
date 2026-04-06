package com.library.service;

import com.library.model.User;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads/avatars}")
    private String uploadDir;

    @Value("${app.upload.max-size:2097152}") // 2MB default
    private long maxFileSize;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");

    // ── Get user ──────────────────────────────────────────────
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    public User getUserById(Long id) {
        return Objects.requireNonNull(
                userRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("User not found with id: " + id)),
                "Resolved user must not be null");
    }

    // ── Update profile ────────────────────────────────────────
    @Transactional
    public User updateProfile(String username, Map<String, String> body) {
        User user = getUserByUsername(username);

        if (body.containsKey("fullName"))
            user.setFullName(body.get("fullName"));
        if (body.containsKey("email"))
            user.setEmail(body.get("email"));
        if (body.containsKey("phone"))
            user.setPhone(body.get("phone"));

        return Objects.requireNonNull(
                userRepository.save(user),
                "User repository returned null while updating profile");
    }

    // ── Upload profile picture ────────────────────────────────
    @Transactional
    public String uploadProfilePicture(String username, MultipartFile file) {
        // Validate
        if (file == null || file.isEmpty())
            throw new RuntimeException("No file provided.");
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new RuntimeException("Invalid file type. Only JPEG, PNG, GIF, WEBP allowed.");
        if (file.getSize() > maxFileSize)
            throw new RuntimeException("File too large. Maximum size is 2MB.");

        User user = getUserByUsername(username);

        try {
            // Ensure upload directory exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath))
                Files.createDirectories(uploadPath);

            // Delete old picture if exists
            if (user.getProfilePicture() != null) {
                Path oldFile = Paths.get(user.getProfilePicture());
                if (Files.exists(oldFile))
                    Files.deleteIfExists(oldFile);
            }

            // Save new file with unique name
            String ext = getExtension(Objects.requireNonNull(file.getOriginalFilename()));
            String filename = "user_" + user.getId() + "_" + System.currentTimeMillis() + ext;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Store relative path
            String relativePath = uploadDir + "/" + filename;
            user.setProfilePicture(relativePath);
            userRepository.save(user);

            return "/" + relativePath;

        } catch (IOException e) {
            throw new RuntimeException("Failed to save profile picture: " + e.getMessage());
        }
    }

    // ── Delete profile picture ────────────────────────────────
    @Transactional
    public void deleteProfilePicture(String username) {
        User user = getUserByUsername(username);
        if (user.getProfilePicture() != null) {
            try {
                Files.deleteIfExists(Paths.get(user.getProfilePicture()));
            } catch (IOException ignored) {
            }
            user.setProfilePicture(null);
            userRepository.save(user);
        }
    }

    // ── Change password ───────────────────────────────────────
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        if (newPassword == null || newPassword.length() < 8 || newPassword.length() > 72)
            throw new RuntimeException("Password must be 8-72 characters.");
        if (currentPassword == null || currentPassword.isBlank())
            throw new RuntimeException("Current password is required.");

        User user = getUserByUsername(username);
        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            throw new RuntimeException("Current password is incorrect.");

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ── Admin: get all users ──────────────────────────────────
    public List<Map<String, Object>> getAllUsersResponse() {
        return userRepository.findAll().stream()
                .map(this::toProfileResponse)
                .collect(Collectors.toList());
    }

    // ── Admin: update role ────────────────────────────────────
    @Transactional
    public User updateUserRole(Long id, String role) {
        User user = getUserById(id);
        try {
            user.setRole(User.Role.valueOf(role.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role + ". Must be ADMIN, LIBRARIAN, or MEMBER.");
        }
        return userRepository.save(user);
    }

    // ── Admin: update status ──────────────────────────────────
    @Transactional
    public User updateUserStatus(Long id, Boolean active) {
        User user = getUserById(id);
        user.setActive(active != null ? active : true);
        return userRepository.save(user);
    }

    // ── Build response map (no password) ─────────────────────
    public Map<String, Object> toProfileResponse(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("fullName", user.getFullName());
        map.put("phone", user.getPhone());
        map.put("role", user.getRole().name());
        map.put("active", user.getActive());
        map.put("memberId", user.getMemberId());
        map.put("createdAt", user.getCreatedAt());
        map.put("profilePicture", user.getProfilePicture() != null
                ? "/" + user.getProfilePicture()
                : null);
        return map;
    }

    // ── Helper ────────────────────────────────────────────────
    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".jpg";
    }
}
