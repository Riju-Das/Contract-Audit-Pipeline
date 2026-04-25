package com.project.contract_audit.controller;

import com.project.contract_audit.model.ContractRecord;
import com.project.contract_audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/contracts")
public class ContractController {

    private final AuditService auditService;

    @PostMapping("/upload")
    public ResponseEntity<ContractRecord> uploadContract(@RequestParam("file")MultipartFile file){

        long userId = 1L;
        ContractRecord response = auditService.processAndSaveContract(file, userId);

        return ResponseEntity.ok(response);
    }

}
