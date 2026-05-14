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

    @JsonProperty("chunk_index")
    private int chunkIndex;

    @JsonProperty("chunk_text")
    private String chunkText;

    @JsonProperty("legal_principle")
    private String legalPrinciple;

    @JsonProperty("matched_policy")
    private String matchedPolicy;

    @JsonProperty("confidence")
    private int confidence;

    @JsonProperty("severity")
    private String severity;

    @JsonProperty("reasoning")
    private String reasoning;

    @JsonProperty("source_file")
    private String sourceFile;
}