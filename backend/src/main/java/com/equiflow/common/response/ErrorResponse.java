package com.equiflow.common.response;

import java.util.Map;

public class ErrorResponse {
    private String code;
    private String message;
    private Map<String, Object> data;

    public ErrorResponse() {
    }

    public ErrorResponse(String code, String message, Map<String, Object> data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
