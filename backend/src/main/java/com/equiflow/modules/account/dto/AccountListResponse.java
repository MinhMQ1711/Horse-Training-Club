package com.equiflow.modules.account.dto;

import java.util.List;

public class AccountListResponse {
    private List<PublicAccountDto> accounts;

    public AccountListResponse() {
    }

    public AccountListResponse(List<PublicAccountDto> accounts) {
        this.accounts = accounts;
    }

    public List<PublicAccountDto> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<PublicAccountDto> accounts) {
        this.accounts = accounts;
    }
}
