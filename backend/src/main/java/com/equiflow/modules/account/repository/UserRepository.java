package com.equiflow.modules.account.repository;

import com.equiflow.modules.account.entity.AccountStatus;
import com.equiflow.modules.account.entity.RoleType;
import com.equiflow.modules.account.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findByRole(RoleType role);
    List<User> findByStatus(AccountStatus status);
    long countByRoleAndStatus(RoleType role, AccountStatus status);
}
