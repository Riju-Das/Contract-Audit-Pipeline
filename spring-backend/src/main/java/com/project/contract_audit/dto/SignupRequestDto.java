package com.project.contract_audit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SignupRequestDto(
        @NotBlank String username,
        @NotBlank String password,
        @NotBlank String fullname,
        @Email @NotBlank String email
) {
}
