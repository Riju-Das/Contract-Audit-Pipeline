package com.project.contract_audit.kafka;
import com.project.contract_audit.dto.ViolationDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditResultEvent {
    private Long contractId;
    private Long userId;
    private String filename;
    private int totalViolations;
    private List<ViolationDto> violations;
    private LocalDateTime processedAt;
}