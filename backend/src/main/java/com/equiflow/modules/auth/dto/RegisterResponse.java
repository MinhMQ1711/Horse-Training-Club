package com.equiflow.modules.auth.dto;

import java.time.Instant;

public class RegisterResponse {
    private String email;
    private Instant sentAt;
    private Instant expiresAt;
    private Instant resendAt;

    public RegisterResponse() {
    }

    public RegisterResponse(String email, Instant sentAt, Instant expiresAt, Instant resendAt) {
        this.email = email;
        this.sentAt = sentAt;
        this.expiresAt = expiresAt;
        this.resendAt = resendAt;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
}
