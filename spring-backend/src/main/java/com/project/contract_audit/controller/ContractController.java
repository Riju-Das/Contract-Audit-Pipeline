package com.project.contract_audit.controller;

import com.project.contract_audit.model.ContractRecord;
import com.project.contract_audit.model.User;
import com.project.contract_audit.repository.ContractRepository;
import com.project.contract_audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/contracts")
public class ContractController {

    private final AuditService auditService;
    private final ContractRepository contractRepository;

    @PostMapping("/upload")
    public ResponseEntity<ContractRecord> uploadContract(
            @RequestParam("file")MultipartFile file,
            @AuthenticationPrincipal User user
            ){
        ContractRecord response = auditService.processAndSaveContract(file, user.getId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractRecord> getContract(@PathVariable Long id) {
        return contractRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
