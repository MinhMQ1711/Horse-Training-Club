package com.equiflow.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class ResetPasswordRequest {
    @NotBlank(message = "Reset token is required")
    private String resetToken;

    @NotBlank(message = "Password is required")
    private String password;

    public ResetPasswordRequest() {
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
