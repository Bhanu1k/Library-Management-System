package com.library.controller;

import com.library.dto.ChangePasswordRequest;
import com.library.dto.LoginRequest;
import com.library.dto.LoginResponse;
import com.library.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication auth,
                                             @RequestBody ChangePasswordRequest request) {
        authService.changePassword(auth.getName(), request);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Password updated successfully."));
    }
}
