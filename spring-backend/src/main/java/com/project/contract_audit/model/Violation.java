package com.project.contract_audit.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Table(name = "violations")
public class Violation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int chunkIndex;

    @Column(columnDefinition = "TEXT")
    private String chunkText;

    @Column(columnDefinition = "TEXT")
    private String legalPrinciple;

    private String severity;

    @Column(columnDefinition = "TEXT")
    private String matchedPolicy;

    private int confidence;

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    @Column(columnDefinition = "TEXT")
    private String sourceFile;

    @ManyToOne
    @JoinColumn(name = "contract_id")
    @ToString.Exclude
    @JsonIgnore
    private ContractRecord contractRecord;
}
