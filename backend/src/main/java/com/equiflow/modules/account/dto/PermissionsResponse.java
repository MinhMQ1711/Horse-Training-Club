package com.equiflow.modules.account.dto;

import java.util.List;

public class PermissionsResponse {
    private PublicAccountDto account;
    private List<String> granted;
    private List<String> revoked;

    public PermissionsResponse() {
    }

    public PermissionsResponse(PublicAccountDto account, List<String> granted, List<String> revoked) {
        this.account = account;
        this.granted = granted;
        this.revoked = revoked;
    }

    public PublicAccountDto getAccount() {
        return account;
    }

    public void setAccount(PublicAccountDto account) {
        this.account = account;
    }

    public List<String> getGranted() {
        return granted;
    }

    public void setGranted(List<String> granted) {
        this.granted = granted;
    }

    public List<String> getRevoked() {
        return revoked;
    }

    public void setRevoked(List<String> revoked) {
        this.revoked = revoked;
    }
}
