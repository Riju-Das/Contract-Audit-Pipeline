package com.project.contract_audit.config;

import java.net.http.HttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${python.base.url}")
    private String pythonBaseURL;

    @Bean
    public RestClient pythonWorkerClient() {
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();

        return RestClient.builder()
                .baseUrl(pythonBaseURL)
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
                .build();
    }
}