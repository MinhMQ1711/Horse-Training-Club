package com.equiflow.modules.auth.repository;

import com.equiflow.modules.auth.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailIgnoreCaseAndPurposeOrderBySentAtDesc(String email, String purpose);
    void deleteByEmailIgnoreCaseAndPurpose(String email, String purpose);
}
