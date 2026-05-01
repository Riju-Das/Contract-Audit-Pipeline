package com.project.contract_audit.security;

import com.project.contract_audit.model.RefreshToken;
import com.project.contract_audit.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshToken createRefreshToken(Long userId){
        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .userId(userId)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyAndRotate(String tokenString){

        RefreshToken storedToken = refreshTokenRepository.findById(tokenString)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token is invalid or expired"));

        refreshTokenRepository.delete(storedToken);

        return createRefreshToken(storedToken.getUserId());
    }

    public void deleteByToken(String tokenString) {
        refreshTokenRepository.deleteById(tokenString);
    }

}
