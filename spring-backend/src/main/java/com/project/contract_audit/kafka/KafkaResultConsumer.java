package com.project.contract_audit.kafka;


import com.project.contract_audit.model.ContractRecord;
import com.project.contract_audit.model.Violation;
import com.project.contract_audit.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.stream.Collectors;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class KafkaResultConsumer {

    private final ContractRepository contractRepository;

    @KafkaListener(
            topics = "contract.audit.result",
            groupId = "spring-audit-result-consumer"
    )
    @Transactional
    public void onAuditResult(
            @Payload AuditResultEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ){

        log.info("Received audit result: contractId={}, partition={}, offset={}",
                event.getContractId(), partition, offset);

        ContractRecord record = contractRepository.findById(event.getContractId())
                .orElseGet(()->{

                    log.warn("ContractRecord not found for id={}, creating new",
                            event.getContractId());

                    return ContractRecord.builder()
                            .userId(event.getUserId())
                            .filename(event.getFilename())
                            .build();

                });

        List<Violation> violations = event.getViolations().stream()
                .map(v -> Violation.builder()
                        .chunkIndex(v.getChunkIndex())
                        .chunkText(v.getChunkText())
                        .severity(v.getSeverity())
                        .legalPrinciple(v.getLegalPrinciple())
                        .matchedPolicy(v.getMatchedPolicy())
                        .confidence(v.getConfidence())
                        .reasoning(v.getReasoning())
                        .sourceFile(v.getSourceFile())
                        .contractRecord(record)
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));

        record.setViolations(violations);
        record.setTotalViolations(event.getTotalViolations());

        contractRepository.save(record);

        log.info("Saved audit result to DB: contractId={}, violations={}",
                event.getContractId(), event.getTotalViolations());


    }

}
