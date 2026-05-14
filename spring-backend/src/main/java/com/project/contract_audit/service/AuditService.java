package com.project.contract_audit.service;


import com.project.contract_audit.dto.ContractResponseDto;
import com.project.contract_audit.model.ContractRecord;
import com.project.contract_audit.model.Violation;
import com.project.contract_audit.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class AuditService {

    private final RestClient pythonWorkerClient;
    private final ContractRepository contractRepository;

    @Transactional
    public ContractRecord processAndSaveContract(MultipartFile file, long userId){

        log.info("Starting audit for file {}" , file.getOriginalFilename());

        if(file.isEmpty()){
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        String filename = (file.getOriginalFilename() == null || file.getOriginalFilename().isBlank())
                ? "uploaded_contract.pdf"
                : file.getOriginalFilename();


        ContractResponseDto auditResponse;

        try{

            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            MultiValueMap<String, Object> multipartBody = new LinkedMultiValueMap<>();
            multipartBody.add("file", resource);

            auditResponse = pythonWorkerClient.post()
                    .uri("/api/v1/audit")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(multipartBody)
                    .retrieve()
                    .body(ContractResponseDto.class);
            }
        catch (RestClientResponseException e) {
            log.error("Python worker HTTP {} {} body={}",
                    e.getStatusCode().value(),
                    e.getStatusText(),
                    e.getResponseBodyAsString(),
                    e);
            throw new RuntimeException("Python worker rejected upload: HTTP " + e.getStatusCode().value());
        }
        catch(RestClientException e){
            log.error("Network error communicating with Python worker: {}", e.getMessage());
            throw new RuntimeException("Failed to communicate with audit service. Please try again later.");
        }
        catch (IOException e){
            log.error("Failed to read uploaded file bytes: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process uploaded file.");
        }
        if (auditResponse == null) {
            throw new RuntimeException("Empty response from Python worker.");
        }

        log.info("Audit Successful for file {}.",file.getOriginalFilename());

        ContractRecord contractRecord = ContractRecord.builder()
                .userId(userId)
                .filename(file.getOriginalFilename())
                .totalViolations(auditResponse.totalViolations())
                .build();

        List<Violation> violations = auditResponse.violations().stream()
                .map(dto -> Violation.builder()
                        .chunkIndex(dto.getChunkIndex())
                        .chunkText(dto.getChunkText())
                        .legalPrinciple(dto.getLegalPrinciple())
                        .matchedPolicy(dto.getMatchedPolicy())
                        .reasoning(dto.getReasoning())
                        .confidence(dto.getConfidence())
                        .severity(dto.getSeverity())
                        .sourceFile(dto.getSourceFile())
                        .contractRecord(contractRecord)
                        .build())
                .toList();

        contractRecord.setViolations(violations);

        return contractRepository.save(contractRecord);





    }

}
