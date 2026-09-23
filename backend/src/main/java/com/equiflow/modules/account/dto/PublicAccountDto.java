package com.equiflow.modules.account.dto;

import com.equiflow.modules.account.entity.AccountStatus;
import com.equiflow.modules.account.entity.RoleType;
import com.equiflow.modules.account.entity.User;

import java.time.Instant;
import java.util.Map;

public class PublicAccountDto {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private RoleType role;
    private AccountStatus status;
    private Instant createdAt;
    private Instant lastActive;
    private Instant requestedAt;
    private String requestCode;
    private Instant lockedAt;
    private Map<String, Boolean> permissions;
    private Instant permissionsChangedAt;
    private String permissionsChangedBy;
    private Map<String, Boolean> notify;

    public PublicAccountDto() {
    }

    public static PublicAccountDto fromEntity(User user) {
        PublicAccountDto dto = new PublicAccountDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastActive(user.getLastActive());
        dto.setRequestedAt(user.getRequestedAt());
        dto.setRequestCode(user.getRequestCode());
        dto.setLockedAt(user.getLockedAt());
        dto.setPermissions(user.getPermissions());
        dto.setPermissionsChangedAt(user.getPermissionsChangedAt());
        dto.setPermissionsChangedBy(user.getPermissionsChangedBy());
        dto.setNotify(user.getNotify());
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public RoleType getRole() {
        return role;
    }

    public void setRole(RoleType role) {
        this.role = role;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getLastActive() {
        return lastActive;
    }

    public void setLastActive(Instant lastActive) {
        this.lastActive = lastActive;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public String getRequestCode() {
        return requestCode;
    }

    public void setRequestCode(String requestCode) {
        this.requestCode = requestCode;
    }

    public Instant getLockedAt() {
        return lockedAt;
    }

    public void setLockedAt(Instant lockedAt) {
        this.lockedAt = lockedAt;
    }

    public Map<String, Boolean> getPermissions() {
        return permissions;
    }

    public void setPermissions(Map<String, Boolean> permissions) {
        this.permissions = permissions;
    }

    public Instant getPermissionsChangedAt() {
        return permissionsChangedAt;
    }

    public void setPermissionsChangedAt(Instant permissionsChangedAt) {
        this.permissionsChangedAt = permissionsChangedAt;
    }

    public String getPermissionsChangedBy() {
        return permissionsChangedBy;
    }

    public void setPermissionsChangedBy(String permissionsChangedBy) {
        this.permissionsChangedBy = permissionsChangedBy;
    }

    public Map<String, Boolean> getNotify() {
        return notify;
    }

    public void setNotify(Map<String, Boolean> notify) {
        this.notify = notify;
    }
}
