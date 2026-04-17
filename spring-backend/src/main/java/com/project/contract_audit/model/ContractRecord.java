package com.project.contract_audit.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "contracts")
public class ContractRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private String filename;

    @Column(name = "total_violations")
    private int totalViolations;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "contractRecord")
    private List<Violation> violations;

    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate(){
        uploadedAt = LocalDateTime.now();
    }
}
