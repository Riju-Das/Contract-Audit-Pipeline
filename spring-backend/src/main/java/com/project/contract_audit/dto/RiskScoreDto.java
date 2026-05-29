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
public class RiskScoreDto {
    private int overall;
    private String grade;
    private int compensation;
    private int termination;

    @JsonProperty("non_compete")
    private int nonCompete;

    @JsonProperty("ip_rights")
    private int ipRights;

    @JsonProperty("data_privacy")
    private int dataPrivacy;
}
