package com.project.contract_audit.model;

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

    private String legalPrinciple;

    private String matchedPolicy;

    private int confidence;

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    private String sourceFile;

    @ManyToOne
    @JoinColumn(name = "contract_id")
    @ToString.Exclude
    private ContractRecord contractRecord;
}
