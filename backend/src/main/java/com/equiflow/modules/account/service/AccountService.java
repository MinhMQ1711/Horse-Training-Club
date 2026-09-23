package com.equiflow.modules.account.service;

import com.equiflow.common.exception.ApiException;
import com.equiflow.common.exception.ErrorCode;
import com.equiflow.modules.account.dto.AccountListResponse;
import com.equiflow.modules.account.dto.PermissionsResponse;
import com.equiflow.modules.account.dto.PublicAccountDto;
import com.equiflow.modules.account.dto.SingleAccountResponse;
import com.equiflow.modules.account.entity.AccountStatus;
import com.equiflow.modules.account.entity.RoleType;
import com.equiflow.modules.account.entity.User;
import com.equiflow.modules.account.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AccountService {

    private final UserRepository userRepository;

    public AccountService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AccountListResponse listAccounts() {
        List<PublicAccountDto> list = userRepository.findAll().stream()
                .map(PublicAccountDto::fromEntity)
                .toList();
        return new AccountListResponse(list);
    }

    public SingleAccountResponse getAccount(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Account not found"));
        return new SingleAccountResponse(PublicAccountDto.fromEntity(user));
    }

    @Transactional
    public SingleAccountResponse inviteStaff(String fullName, String email, RoleType role) {
        String cleanEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new ApiException(ErrorCode.EMAIL_TAKEN, "An account with this email already exists");
        }

        User user = new User();
        user.setId(java.util.UUID.randomUUID().toString());
        user.setFullName(fullName.trim());
        user.setEmail(cleanEmail);
        user.setPassword(""); // no password until invite accepted
        user.setRole(role);
        user.setStatus(AccountStatus.INVITED);
        user.setCreatedAt(Instant.now());
        user.setPermissions(com.equiflow.modules.account.entity.PermissionHelper.defaultPermissions(role));
        user.setNotify(com.equiflow.modules.account.entity.PermissionHelper.defaultNotify(role));
        userRepository.save(user);

        return new SingleAccountResponse(PublicAccountDto.fromEntity(user));
    }

    @Transactional
    public SingleAccountResponse approveAccount(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Account not found"));

        if (user.getStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new ApiException(ErrorCode.INVALID_STATE, "Account is not pending approval");
        }

        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
        return new SingleAccountResponse(PublicAccountDto.fromEntity(user));
    }

    @Transactional
    public SingleAccountResponse declineAccount(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Account not found"));

        if (user.getStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new ApiException(ErrorCode.INVALID_STATE, "Account is not pending approval");
        }

        user.setStatus(AccountStatus.REJECTED);
        userRepository.save(user);
        return new SingleAccountResponse(PublicAccountDto.fromEntity(user));
    }

    @Transactional
    public SingleAccountResponse lockAccount(String id, String currentUserId) {
        if (id.equals(currentUserId)) {
            throw new ApiException(ErrorCode.CANNOT_LOCK_SELF, "You cannot lock your own account");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Account not found"));

        if (user.getRole() == RoleType.CLUB_MANAGER &&
                userRepository.countByRoleAndStatus(RoleType.CLUB_MANAGER, AccountStatus.ACTIVE) <= 1) {
            throw new ApiException(ErrorCode.LAST_MANAGER, "Cannot lock the last active Club Manager");
        }

        user.setStatus(AccountStatus.LOCKED);
        user.setLockedAt(Instant.now());
        userRepository.save(user);
        return new SingleAccountResponse(PublicAccountDto.fromEntity(user));
    }

    @Transactional
    public SingleAccountResponse unlockAccount(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Account not found"));

        if (user.getStatus() != AccountStatus.LOCKED) {
            throw new ApiException(ErrorCode.INVALID_STATE, "Account is not locked");
        }

        user.setStatus(AccountStatus.ACTIVE);
        user.setLockedAt(null);
        userRepository.save(user);
        return new SingleAccountResponse(PublicAccountDto.fromEntity(user));
    }

    @Transactional
    public PermissionsResponse updatePermissions(String id, Map<String, Boolean> newPermissions, String changedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Account not found"));

        Map<String, Boolean> current = user.getPermissions();
        List<String> granted = new ArrayList<>();
        List<String> revoked = new ArrayList<>();

        for (Map.Entry<String, Boolean> entry : newPermissions.entrySet()) {
            String key = entry.getKey();
            boolean newVal = Boolean.TRUE.equals(entry.getValue());
            boolean oldVal = Boolean.TRUE.equals(current.get(key));

            // Force locked switches according to ARCHITECTURE.md
            if ("viewHorses".equals(key)) {
                newVal = true;
            }
            if (user.getRole() == RoleType.CLUB_MANAGER && "manageAccounts".equals(key)) {
                newVal = true;
            }

            if (newVal != oldVal) {
                if (newVal) granted.add(key);
                else revoked.add(key);
            }
            current.put(key, newVal);
        }

        user.setPermissions(current);
        user.setPermissionsChangedAt(Instant.now());
        user.setPermissionsChangedBy(changedBy != null ? changedBy : "Club Manager");
        userRepository.save(user);

        return new PermissionsResponse(PublicAccountDto.fromEntity(user), granted, revoked);
    }
}
