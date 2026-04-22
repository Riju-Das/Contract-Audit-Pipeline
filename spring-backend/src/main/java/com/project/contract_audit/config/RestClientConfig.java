package com.project.contract_audit.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;


@Configuration
public class RestClientConfig {

    @Value("${python.base.url}")
    private String pythonBaseURL;

    @Bean
    public RestClient pythonWorkerClient(){
        return RestClient.builder()
                .baseUrl(pythonBaseURL)
                .build();
    }
}
