package com.project.contract_audit.repository;

import com.project.contract_audit.model.Violation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface violationRepository extends JpaRepository<Violation,Long> {
}
