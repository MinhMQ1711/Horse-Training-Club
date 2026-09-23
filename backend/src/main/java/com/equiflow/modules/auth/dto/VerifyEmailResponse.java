package com.equiflow.modules.auth.dto;

import com.equiflow.modules.account.entity.RoleType;

import java.time.Instant;

public class VerifyEmailResponse {
    private String email;
    private String fullName;
    private RoleType role;
    private String requestCode;
    private Instant requestedAt;
    private String reviewer;

    public VerifyEmailResponse() {
    }

    public VerifyEmailResponse(String email, String fullName, RoleType role, String requestCode, Instant requestedAt, String reviewer) {
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.requestCode = requestCode;
        this.requestedAt = requestedAt;
        this.reviewer = reviewer;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public RoleType getRole() {
        return role;
    }

    public void setRole(RoleType role) {
        this.role = role;
    }

    public String getRequestCode() {
        return requestCode;
    }

    public void setRequestCode(String requestCode) {
        this.requestCode = requestCode;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public String getReviewer() {
        return reviewer;
    }

    public void setReviewer(String reviewer) {
        this.reviewer = reviewer;
    }
}
