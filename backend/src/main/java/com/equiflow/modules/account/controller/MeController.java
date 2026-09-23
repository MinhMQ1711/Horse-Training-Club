package com.equiflow.modules.account.controller;

import com.equiflow.common.exception.ApiException;
import com.equiflow.common.exception.ErrorCode;
import com.equiflow.modules.account.dto.PublicAccountDto;
import com.equiflow.modules.account.entity.User;
import com.equiflow.modules.account.repository.UserRepository;
import com.equiflow.modules.auth.dto.AuthResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/me")
public class MeController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public MeController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(@RequestBody Map<String, String> body, HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Not authenticated");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "User not found"));

        if (body.containsKey("fullName") && !body.get("fullName").trim().isEmpty()) {
            user.setFullName(body.get("fullName").trim());
        }
        if (body.containsKey("phone")) {
            user.setPhone(body.get("phone").trim());
        }

        userRepository.save(user);
        return ResponseEntity.ok(new AuthResponse(PublicAccountDto.fromEntity(user)));
    }

    @PostMapping("/password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> body, HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Not authenticated");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "User not found"));

        String current = body.get("current");
        String next = body.get("next");

        if (current == null || !passwordEncoder.matches(current, user.getPassword())) {
            throw new ApiException(ErrorCode.WRONG_PASSWORD, "Current password is incorrect");
        }

        if (next == null || next.length() < 8) {
            throw new ApiException(ErrorCode.WEAK_PASSWORD, "Password must be at least 8 characters");
        }

        if (current.equals(next)) {
            throw new ApiException(ErrorCode.SAME_PASSWORD, "New password cannot be the same as current");
        }

        user.setPassword(passwordEncoder.encode(next));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("nextChangeDue", Instant.now().plus(180, ChronoUnit.DAYS).toString()));
    }
}
