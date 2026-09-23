package com.equiflow.modules.account.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RoleType role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AccountStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant lastActive;
    private Instant requestedAt;

    @Column(length = 30)
    private String requestCode;

    private Instant lockedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_permissions", joinColumns = @JoinColumn(name = "user_id"))
    @MapKeyColumn(name = "permission_key")
    @Column(name = "granted")
    private Map<String, Boolean> permissions = new HashMap<>();

    private Instant permissionsChangedAt;

    @Column(length = 100)
    private String permissionsChangedBy;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_notifications", joinColumns = @JoinColumn(name = "user_id"))
    @MapKeyColumn(name = "notify_key")
    @Column(name = "enabled")
    private Map<String, Boolean> notify = new HashMap<>();

    private int failedLoginAttempts = 0;
    private Instant lockedUntil;

    public User() {
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public Instant getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(Instant lockedUntil) {
        this.lockedUntil = lockedUntil;
    }
}
