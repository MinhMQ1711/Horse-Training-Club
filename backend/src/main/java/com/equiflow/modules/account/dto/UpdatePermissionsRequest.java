package com.equiflow.modules.account.dto;

import java.util.Map;

public class UpdatePermissionsRequest {
    private Map<String, Boolean> permissions;

    public UpdatePermissionsRequest() {
    }

    public Map<String, Boolean> getPermissions() {
        return permissions;
    }

    public void setPermissions(Map<String, Boolean> permissions) {
        this.permissions = permissions;
    }
}
