package com.project.contract_audit.repository;

import com.project.contract_audit.model.RefreshToken;

import java.util.Optional;

public interface RefreshTokenRepository {
    Optional<RefreshToken> findByUserId(Long UserId);
}
