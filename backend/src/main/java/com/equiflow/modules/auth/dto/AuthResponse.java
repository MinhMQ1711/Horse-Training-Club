package com.equiflow.modules.auth.dto;

import com.equiflow.modules.account.dto.PublicAccountDto;

public class AuthResponse {
    private PublicAccountDto user;

    public AuthResponse() {
    }

    public AuthResponse(PublicAccountDto user) {
        this.user = user;
    }

    public PublicAccountDto getUser() {
        return user;
    }

    public void setUser(PublicAccountDto user) {
        this.user = user;
    }
}
