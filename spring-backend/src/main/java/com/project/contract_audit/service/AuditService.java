package com.project.contract_audit.service;
import com.project.contract_audit.kafka.AuditRequestEvent;
import com.project.contract_audit.kafka.KafkaProducerService;
import com.project.contract_audit.model.ContractRecord;
import com.project.contract_audit.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;


@Slf4j
@RequiredArgsConstructor
@Service
public class AuditService {

    private final ContractRepository contractRepository;
    private final KafkaProducerService kafkaProducerService;
    private static final String CONTRACT_STORAGE_DIR = "/tmp/contracts";

    @Transactional
    public ContractRecord processAndSaveContract(MultipartFile file,  Long userId){

        log.info("Starting async audit for file {}", file.getOriginalFilename());

        if(file.isEmpty()){
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        String filename = (file.getOriginalFilename() == null
                || file.getOriginalFilename().isBlank())
                ? "uploaded_contract.pdf"
                : file.getOriginalFilename();

        ContractRecord record = ContractRecord.builder()
                .userId(userId)
                .filename(filename)
                .totalViolations(-1)
                .build();

        contractRepository.save(record);

        String uniqueFilename = record.getId() + "_" + filename;

        String filePath = saveFile(file , uniqueFilename);


        AuditRequestEvent event = AuditRequestEvent.builder()
                .contractId(record.getId())
                .userId(userId)
                .filename(filename)
                .fileStoragePath(filePath)
                .uploadedAt(LocalDateTime.now())
                .build();

        kafkaProducerService.sendAuditRequest(event);

        log.info("Published audit request to Kafka: contractId={}", record.getId());

        return record;

    }

    private String saveFile(MultipartFile file, String filename) {
        try {
            Path dir = Paths.get(CONTRACT_STORAGE_DIR);
            Files.createDirectories(dir);
            Path dest = dir.resolve(filename);
            file.transferTo(dest.toFile());
            log.info("Saved file to {}", dest.toAbsolutePath());
            return dest.toAbsolutePath().toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save uploaded file: " + e.getMessage());
        }
    }


}
