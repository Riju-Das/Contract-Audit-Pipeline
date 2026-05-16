package com.project.contract_audit.kafka;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private static final String AUDIT_REQUEST_TOPIC = "contract.audit.request";

    private final KafkaTemplate<String , Object> kafkaTemplate;

    public void sendAuditRequest(AuditRequestEvent event){

        String key = String.valueOf(event.getContractId());

        CompletableFuture<SendResult<String, Object>> future =
                kafkaTemplate.send(AUDIT_REQUEST_TOPIC , key , event);

        future.whenComplete((result, ex)->{
            if(ex!=null){
                log.error("Failed to send audit request for contractId={}: {}",
                        event.getContractId(),
                        ex.getMessage());
            }
            else{
                log.info("Sent audit request: contractId={}, topic={}, partition={}, offset={}",
                        event.getContractId(),
                        result.getRecordMetadata().topic(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }

        });
    }

}
