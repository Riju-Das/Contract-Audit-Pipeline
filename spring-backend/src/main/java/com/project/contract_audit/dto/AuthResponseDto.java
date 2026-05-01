package com.project.contract_audit.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;

@Builder
public record AuthResponseDto(
        String accessToken,

        @JsonIgnore
        String refreshToken,

        Long userId,
        String username,
        String fullname
) {
}
