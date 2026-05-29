package com.project.contract_audit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViolationDto {
    private int chunkIndex;
    private String chunkText;
    private String legalPrinciple;
    private String matchedPolicy;
    private int confidence;
    private String severity;
    private String reasoning;
    private String plainSummary;
    private String sourceFile;
}