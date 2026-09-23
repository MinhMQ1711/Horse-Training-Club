package com.equiflow.modules.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "otp_tokens")
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String purpose; // "signup" or "reset"

    @Column(nullable = false, length = 10)
    private String code;

    @Column(nullable = false)
    private Instant sentAt;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Instant resendAt;

    @Column(nullable = false)
    private int attempts = 0;

    public OtpToken() {
    }

    public OtpToken(String email, String purpose, String code, Instant sentAt, Instant expiresAt, Instant resendAt) {
        this.email = email;
        this.purpose = purpose;
        this.code = code;
        this.sentAt = sentAt;
        this.expiresAt = expiresAt;
        this.resendAt = resendAt;
        this.attempts = 0;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getResendAt() {
        return resendAt;
    }

    public void setResendAt(Instant resendAt) {
        this.resendAt = resendAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }
}
