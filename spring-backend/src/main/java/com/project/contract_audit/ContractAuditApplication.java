package com.project.contract_audit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class ContractAuditApplication {
	public static void main(String[] args) {
		SpringApplication.run(ContractAuditApplication.class, args);
	}
}
