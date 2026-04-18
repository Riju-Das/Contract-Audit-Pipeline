package com.project.contract_audit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import java.util.List;

@Builder
public record AuditResponseDto(
        String filename,
        @JsonProperty("total_violations") int totalViolations,
        List<ViolationDto> violations

) {
}
