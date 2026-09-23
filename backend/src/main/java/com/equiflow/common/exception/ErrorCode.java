package com.equiflow.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS"),
    ATTEMPTS_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "ATTEMPTS_EXCEEDED"),
    EMAIL_NOT_VERIFIED(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED"),
    ACCOUNT_PENDING(HttpStatus.FORBIDDEN, "ACCOUNT_PENDING"),
    PENDING_INTAKE(HttpStatus.FORBIDDEN, "PENDING_INTAKE"),
    ACCOUNT_INVITED(HttpStatus.FORBIDDEN, "ACCOUNT_INVITED"),
    ACCOUNT_INACTIVE(HttpStatus.FORBIDDEN, "ACCOUNT_INACTIVE"),
    ACCOUNT_REJECTED(HttpStatus.FORBIDDEN, "ACCOUNT_REJECTED"),
    ACCOUNT_LOCKED(HttpStatus.valueOf(423), "ACCOUNT_LOCKED"),
    VALIDATION(HttpStatus.BAD_REQUEST, "VALIDATION"),
    INVALID_EMAIL(HttpStatus.BAD_REQUEST, "INVALID_EMAIL"),
    ROLE_NOT_ALLOWED(HttpStatus.FORBIDDEN, "ROLE_NOT_ALLOWED"),
    EMAIL_TAKEN(HttpStatus.CONFLICT, "EMAIL_TAKEN"),
    OTP_INVALID(HttpStatus.BAD_REQUEST, "OTP_INVALID"),
    OTP_EXPIRED(HttpStatus.BAD_REQUEST, "OTP_EXPIRED"),
    OTP_NOT_FOUND(HttpStatus.NOT_FOUND, "OTP_NOT_FOUND"),
    OTP_ATTEMPTS_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "OTP_ATTEMPTS_EXCEEDED"),
    OTP_COOLDOWN(HttpStatus.TOO_MANY_REQUESTS, "OTP_COOLDOWN"),
    RESET_EXPIRED(HttpStatus.BAD_REQUEST, "RESET_EXPIRED"),
    WEAK_PASSWORD(HttpStatus.BAD_REQUEST, "WEAK_PASSWORD"),
    WRONG_PASSWORD(HttpStatus.BAD_REQUEST, "WRONG_PASSWORD"),
    SAME_PASSWORD(HttpStatus.BAD_REQUEST, "SAME_PASSWORD"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "NOT_FOUND"),
    INVALID_STATE(HttpStatus.CONFLICT, "INVALID_STATE"),
    CANNOT_LOCK_SELF(HttpStatus.CONFLICT, "CANNOT_LOCK_SELF"),
    LAST_MANAGER(HttpStatus.CONFLICT, "LAST_MANAGER");

    private final HttpStatus status;
    private final String code;

    ErrorCode(HttpStatus status, String code) {
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
