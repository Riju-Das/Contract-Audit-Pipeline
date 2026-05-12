package com.project.contract_audit.kafka;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditRequestEvent {
    private Long contractId;
    private Long userId;
    private String filename;
    private String fileStoragePath;
    private LocalDateTime uploadedAt;
}
