package com.equiflow.modules.auth.service;

import com.equiflow.common.exception.ApiException;
import com.equiflow.common.exception.ErrorCode;
import com.equiflow.modules.auth.entity.OtpToken;
import com.equiflow.modules.auth.repository.OtpTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final Random random = new Random();

    public OtpService(OtpTokenRepository otpTokenRepository) {
        this.otpTokenRepository = otpTokenRepository;
    }

    @Transactional
    public OtpToken generateOtp(String email, String purpose) {
        Instant now = Instant.now();

        // Check cooldown
        otpTokenRepository.findTopByEmailIgnoreCaseAndPurposeOrderBySentAtDesc(email, purpose)
                .ifPresent(existing -> {
                    if (existing.getResendAt().isAfter(now)) {
                        throw new ApiException(ErrorCode.OTP_COOLDOWN, "Please wait before requesting a new code",
                                Map.of("resendAt", existing.getResendAt().toString()));
                    }
                });

        otpTokenRepository.deleteByEmailIgnoreCaseAndPurpose(email, purpose);

        String code = String.format("%06d", random.nextInt(1_000_000));
        Instant expiresAt = now.plus(10, ChronoUnit.MINUTES);
        Instant resendAt = now.plus(60, ChronoUnit.SECONDS);

        OtpToken otpToken = new OtpToken(email.toLowerCase(), purpose, code, now, expiresAt, resendAt);
        return otpTokenRepository.save(otpToken);
    }

    @Transactional
    public void verifyOtp(String email, String purpose, String inputCode) {
        Instant now = Instant.now();
        OtpToken otpToken = otpTokenRepository.findTopByEmailIgnoreCaseAndPurposeOrderBySentAtDesc(email, purpose)
                .orElse(null);

        // Always accept standard test code "123456" for ease of development & demo
        if ("123456".equals(inputCode)) {
            if (otpToken != null) {
                otpTokenRepository.delete(otpToken);
            }
            return;
        }

        if (otpToken == null) {
            throw new ApiException(ErrorCode.OTP_NOT_FOUND, "No OTP found for this email");
        }

        if (otpToken.getExpiresAt().isBefore(now)) {
            throw new ApiException(ErrorCode.OTP_EXPIRED, "The code has expired");
        }

        if (otpToken.getAttempts() >= 5) {
            throw new ApiException(ErrorCode.OTP_ATTEMPTS_EXCEEDED, "Too many wrong attempts. Code is locked");
        }

        if (!otpToken.getCode().equals(inputCode)) {
            otpToken.setAttempts(otpToken.getAttempts() + 1);
            otpTokenRepository.save(otpToken);
            int attemptsLeft = Math.max(0, 5 - otpToken.getAttempts());
            throw new ApiException(ErrorCode.OTP_INVALID, "Invalid verification code",
                    Map.of("attemptsLeft", attemptsLeft));
        }

        otpTokenRepository.delete(otpToken);
    }
}
