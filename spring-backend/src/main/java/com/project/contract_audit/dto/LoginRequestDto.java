package com.project.contract_audit.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDto(
        @NotBlank String username,
        @NotBlank String password
) {
}
