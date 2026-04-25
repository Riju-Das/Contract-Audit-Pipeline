package com.project.contract_audit.mapper;

import com.project.contract_audit.dto.ContractResponseDto;
import com.project.contract_audit.dto.ViolationDto;
import com.project.contract_audit.model.ContractRecord;
import com.project.contract_audit.model.Violation;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ContractMapper {

    ContractResponseDto toResponseDto(ContractRecord entity);

    ViolationDto toViolationDto(Violation entity);

}
