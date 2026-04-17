package com.project.contract_audit.repository;

import com.project.contract_audit.model.ContractRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface contractRepository extends JpaRepository<ContractRecord, Long> {
    List<ContractRecord> findByUserIdOrderByUploadedAtDesc(Long userId);
}
