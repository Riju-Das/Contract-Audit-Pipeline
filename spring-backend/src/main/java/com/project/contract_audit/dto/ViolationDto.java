package com.project.contract_audit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record ViolationDto (
    @JsonProperty("chunk_index")  int chunkIndex,
    @JsonProperty("chunk_text")  String chunkText,
    @JsonProperty("legal_principle")  String legalPrinciple,
    @JsonProperty("matched_policy")  String matchedPolicy,
    @JsonProperty("confidence")  int confidence,
    @JsonProperty("reasoning")  String reasoning,
    @JsonProperty("source_file") String sourceFile
){}
