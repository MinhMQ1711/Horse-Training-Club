package com.equiflow.modules.auth.controller;

import com.equiflow.modules.auth.dto.*;
import com.equiflow.modules.auth.entity.OtpToken;
import com.equiflow.modules.auth.service.AuthService;
import com.equiflow.modules.auth.service.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthService authService, OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<VerifyEmailResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest req) {
        return ResponseEntity.ok(authService.verifyEmail(req));
    }

    @GetMapping("/otp")
    public ResponseEntity<Map<String, Object>> getOtpCountdown(@RequestParam String email, @RequestParam String purpose) {
        // Return active OTP countdown info
        return ResponseEntity.ok(Map.of(
                "sentAt", java.time.Instant.now(),
                "expiresAt", java.time.Instant.now().plus(10, java.time.temporal.ChronoUnit.MINUTES),
                "resendAt", java.time.Instant.now().plus(60, java.time.temporal.ChronoUnit.SECONDS)
        ));
    }

    @PostMapping("/otp/resend")
    public ResponseEntity<RegisterResponse> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String purpose = body.getOrDefault("purpose", "signup");
        OtpToken token = otpService.generateOtp(email, purpose);
        return ResponseEntity.ok(new RegisterResponse(email, token.getSentAt(), token.getExpiresAt(), token.getResendAt()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req, HttpServletRequest request) {
        return ResponseEntity.ok(authService.login(req, request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(HttpSession session) {
        return ResponseEntity.ok(authService.getCurrentUser(session));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Boolean>> logout(HttpSession session) {
        authService.logout(session);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        return ResponseEntity.ok(authService.forgotPassword(req));
    }

    @PostMapping("/reset-password/verify")
    public ResponseEntity<Map<String, Object>> verifyReset(@Valid @RequestBody VerifyResetRequest req) {
        return ResponseEntity.ok(authService.verifyReset(req));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        return ResponseEntity.ok(authService.resetPassword(req));
    }
}
