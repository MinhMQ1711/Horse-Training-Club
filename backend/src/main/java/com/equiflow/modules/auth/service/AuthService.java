package com.equiflow.modules.auth.service;

import com.equiflow.common.exception.ApiException;
import com.equiflow.common.exception.ErrorCode;
import com.equiflow.modules.account.dto.PublicAccountDto;
import com.equiflow.modules.account.entity.AccountStatus;
import com.equiflow.modules.account.entity.PermissionHelper;
import com.equiflow.modules.account.entity.RoleType;
import com.equiflow.modules.account.entity.User;
import com.equiflow.modules.account.repository.UserRepository;
import com.equiflow.modules.auth.dto.*;
import com.equiflow.modules.auth.entity.OtpToken;
import com.equiflow.modules.auth.entity.ResetToken;
import com.equiflow.modules.auth.repository.ResetTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final ResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AtomicInteger seq = new AtomicInteger(14);

    public AuthService(UserRepository userRepository,
                       OtpService otpService,
                       ResetTokenRepository resetTokenRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.otpService = otpService;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest req) {
        if (req.getRole() != RoleType.HORSE_OWNER) {
            throw new ApiException(ErrorCode.ROLE_NOT_ALLOWED, "Only Horse Owner accounts can register directly");
        }

        String email = req.getEmail().trim().toLowerCase();
        if (!email.endsWith("@gmail.com")) {
            throw new ApiException(ErrorCode.INVALID_EMAIL, "Email must be a @gmail.com address");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(ErrorCode.EMAIL_TAKEN, "An account with this email already exists");
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setFullName(req.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(RoleType.HORSE_OWNER);
        user.setStatus(AccountStatus.PENDING_EMAIL);
        user.setCreatedAt(Instant.now());
        user.setPermissions(PermissionHelper.defaultPermissions(RoleType.HORSE_OWNER));
        user.setNotify(PermissionHelper.defaultNotify(RoleType.HORSE_OWNER));
        userRepository.save(user);

        OtpToken otp = otpService.generateOtp(email, "signup");
        return new RegisterResponse(email, otp.getSentAt(), otp.getExpiresAt(), otp.getResendAt());
    }

    @Transactional
    public VerifyEmailResponse verifyEmail(VerifyEmailRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        otpService.verifyOtp(email, "signup", req.getCode().trim());

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "User not found"));

        user.setStatus(AccountStatus.PENDING_APPROVAL);
        user.setRequestedAt(Instant.now());
        String code = String.format("REQ-2609-%03d", seq.getAndIncrement());
        user.setRequestCode(code);
        userRepository.save(user);

        return new VerifyEmailResponse(user.getEmail(), user.getFullName(), user.getRole(),
                code, user.getRequestedAt(), "Đỗ Quốc Việt");
    }

    @Transactional
    public AuthResponse login(LoginRequest req, HttpServletRequest httpServletRequest) {
        String email = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        if (user == null) {
            throw new ApiException(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password",
                    Map.of("attemptsLeft", 4));
        }

        Instant now = Instant.now();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            throw new ApiException(ErrorCode.ATTEMPTS_EXCEEDED, "Account temporarily locked due to too many failed attempts",
                    Map.of("retryAt", user.getLockedUntil().toString()));
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            int fails = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(fails);
            if (fails >= 5) {
                user.setLockedUntil(now.plus(15, ChronoUnit.MINUTES));
                user.setFailedLoginAttempts(0);
                userRepository.save(user);
                throw new ApiException(ErrorCode.ATTEMPTS_EXCEEDED, "5 wrong passwords. Blocked for 15 minutes",
                        Map.of("retryAt", user.getLockedUntil().toString()));
            }
            userRepository.save(user);
            int attemptsLeft = Math.max(0, 5 - fails);
            throw new ApiException(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password",
                    Map.of("attemptsLeft", attemptsLeft));
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        Map<String, Object> lockData = Map.of(
                "fullName", user.getFullName(),
                "roleLabel", user.getRole().name(),
                "lockedAt", user.getLockedAt() != null ? user.getLockedAt().toString() : "",
                "requestedAt", user.getRequestedAt() != null ? user.getRequestedAt().toString() : ""
        );

        switch (user.getStatus()) {
            case PENDING_EMAIL:
                throw new ApiException(ErrorCode.EMAIL_NOT_VERIFIED, "Email is not verified", lockData);
            case PENDING_APPROVAL:
                throw new ApiException(ErrorCode.ACCOUNT_PENDING, "Account is waiting for Club Manager approval", lockData);
            case PENDING_INTAKE:
                throw new ApiException(ErrorCode.PENDING_INTAKE, "Account approved, waiting for horse intake", lockData);
            case INVITED:
                throw new ApiException(ErrorCode.ACCOUNT_INVITED, "Invitation not accepted yet", lockData);
            case LOCKED:
                throw new ApiException(ErrorCode.ACCOUNT_LOCKED, "Account has been locked by Club Manager", lockData);
            case REJECTED:
                throw new ApiException(ErrorCode.ACCOUNT_REJECTED, "Account request was declined", lockData);
            case INACTIVE:
                throw new ApiException(ErrorCode.ACCOUNT_INACTIVE, "Account is deactivated", lockData);
            case ACTIVE:
                break;
        }

        user.setLastActive(now);
        userRepository.save(user);

        // Establish Spring Security Session
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        HttpSession session = httpServletRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);
        session.setAttribute("USER_ID", user.getId());

        return new AuthResponse(PublicAccountDto.fromEntity(user));
    }

    public AuthResponse getCurrentUser(HttpSession session) {
        if (session == null) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Session expired or not logged in");
        }

        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            SecurityContext context = (SecurityContext) session.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
            if (context != null && context.getAuthentication() != null) {
                String email = context.getAuthentication().getName();
                User user = userRepository.findByEmailIgnoreCase(email)
                        .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHENTICATED, "User not found"));
                return new AuthResponse(PublicAccountDto.fromEntity(user));
            }
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Session expired or not logged in");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHENTICATED, "User not found"));
        return new AuthResponse(PublicAccountDto.fromEntity(user));
    }

    public void logout(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        Instant now = Instant.now();
        Instant expiresAt = now.plus(10, ChronoUnit.MINUTES);
        Instant resendAt = now.plus(60, ChronoUnit.SECONDS);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            OtpToken otp = otpService.generateOtp(email, "reset");
            return Map.of("sent", true, "sentAt", otp.getSentAt(), "expiresAt", otp.getExpiresAt(), "resendAt", otp.getResendAt());
        }

        // Always return success response to prevent email probing
        return Map.of("sent", true, "sentAt", now, "expiresAt", expiresAt, "resendAt", resendAt);
    }

    @Transactional
    public Map<String, Object> verifyReset(VerifyResetRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        otpService.verifyOtp(email, "reset", req.getCode().trim());

        resetTokenRepository.deleteByEmailIgnoreCase(email);
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(10, ChronoUnit.MINUTES);

        ResetToken resetToken = new ResetToken(token, email, expiresAt);
        resetTokenRepository.save(resetToken);

        return Map.of("resetToken", token, "expiresAt", expiresAt);
    }

    @Transactional
    public Map<String, Object> resetPassword(ResetPasswordRequest req) {
        ResetToken resetToken = resetTokenRepository.findByToken(req.getResetToken())
                .orElseThrow(() -> new ApiException(ErrorCode.RESET_EXPIRED, "Reset token is invalid or expired"));

        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            resetTokenRepository.delete(resetToken);
            throw new ApiException(ErrorCode.RESET_EXPIRED, "Reset token is expired");
        }

        User user = userRepository.findByEmailIgnoreCase(resetToken.getEmail())
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "User not found"));

        user.setPassword(passwordEncoder.encode(req.getPassword()));
        userRepository.save(user);
        resetTokenRepository.delete(resetToken);

        return Map.of("ok", true);
    }
}
