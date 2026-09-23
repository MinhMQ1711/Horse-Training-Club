package com.equiflow.common.exception;

import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.Map;

public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String code;
    private final Map<String, Object> data;

    public ApiException(ErrorCode errorCode, String message) {
        this(errorCode.getStatus(), errorCode.getCode(), message, Collections.emptyMap());
    }

    public ApiException(ErrorCode errorCode, String message, Map<String, Object> data) {
        this(errorCode.getStatus(), errorCode.getCode(), message, data);
    }

    public ApiException(HttpStatus status, String code, String message, Map<String, Object> data) {
        super(message != null ? message : code);
        this.status = status;
        this.code = code;
        this.data = data != null ? data : Collections.emptyMap();
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public Map<String, Object> getData() {
        return data;
    }
}
