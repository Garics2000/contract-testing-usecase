package org.ie.ctc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${backend.url}")
    private String backendUrl;

    @Bean
    public WebClient webClient() {
        // Log the request URL
        return WebClient.builder()
                .baseUrl(backendUrl)
                .filters(exchangeFilterFunctions -> {
                    // Log the request URL
                    exchangeFilterFunctions.add((request, next) -> {
                        System.out.println("Request URL: " + request.url());
                        return next.exchange(request);
                    });
                })
                .build();
    }
}