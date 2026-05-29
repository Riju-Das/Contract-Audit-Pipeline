package com.project.contract_audit.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreEmbeddable {

    private int overall;
    private String grade;
    private int compensation;
    private int termination;
    private int nonCompete;
    private int ipRights;
    private int dataPrivacy;
}
