package com.equiflow.modules.account.dto;

public class SingleAccountResponse {
    private PublicAccountDto account;

    public SingleAccountResponse() {
    }

    public SingleAccountResponse(PublicAccountDto account) {
        this.account = account;
    }

    public PublicAccountDto getAccount() {
        return account;
    }

    public void setAccount(PublicAccountDto account) {
        this.account = account;
    }
}
