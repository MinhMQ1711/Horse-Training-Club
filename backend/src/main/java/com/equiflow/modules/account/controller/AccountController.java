package com.equiflow.modules.account.controller;

import com.equiflow.modules.account.dto.AccountListResponse;
import com.equiflow.modules.account.dto.PermissionsResponse;
import com.equiflow.modules.account.dto.SingleAccountResponse;
import com.equiflow.modules.account.dto.UpdatePermissionsRequest;
import com.equiflow.modules.account.service.AccountService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<AccountListResponse> listAccounts() {
        return ResponseEntity.ok(accountService.listAccounts());
    }

    @PostMapping
    public ResponseEntity<SingleAccountResponse> inviteStaff(@RequestBody java.util.Map<String, String> body) {
        String fullName = body.get("fullName");
        String email = body.get("email");
        String roleStr = body.get("role");
        com.equiflow.modules.account.entity.RoleType role = com.equiflow.modules.account.entity.RoleType.valueOf(roleStr);
        return ResponseEntity.ok(accountService.inviteStaff(fullName, email, role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SingleAccountResponse> getAccount(@PathVariable String id) {
        return ResponseEntity.ok(accountService.getAccount(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<SingleAccountResponse> approveAccount(@PathVariable String id) {
        return ResponseEntity.ok(accountService.approveAccount(id));
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<SingleAccountResponse> declineAccount(@PathVariable String id) {
        return ResponseEntity.ok(accountService.declineAccount(id));
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<SingleAccountResponse> lockAccount(@PathVariable String id, HttpSession session) {
        String currentUserId = (String) session.getAttribute("USER_ID");
        return ResponseEntity.ok(accountService.lockAccount(id, currentUserId != null ? currentUserId : ""));
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<SingleAccountResponse> unlockAccount(@PathVariable String id) {
        return ResponseEntity.ok(accountService.unlockAccount(id));
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<PermissionsResponse> updatePermissions(
            @PathVariable String id,
            @RequestBody UpdatePermissionsRequest req,
            HttpSession session) {
        return ResponseEntity.ok(accountService.updatePermissions(id, req.getPermissions(), "Club Manager"));
    }
}
