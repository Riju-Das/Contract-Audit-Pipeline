package com.project.contract_audit.repository;

import com.project.contract_audit.model.ContractRecord;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractRepository extends JpaRepository<ContractRecord, Long> {
    Page<ContractRecord> findByUserIdOrderByUploadedAtDesc(Long userId, Pageable pageable);
}
