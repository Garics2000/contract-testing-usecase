package org.ie.ctc.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/gateway/apps")
public class GatewayController {
    private final WebClient webClient;

    public GatewayController(WebClient webClient) {
        this.webClient = webClient;
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<?>> searchApps(@RequestParam String term) {
        return webClient.get()
                .uri("/api/apps/search?term=" + term)
                .retrieve()
                .bodyToFlux(Map.class)
                .collectList()
                .map(results -> {
                    if (results.isEmpty()) {
                        return ResponseEntity.<Object>notFound().build();
                    }
                    return ResponseEntity.ok(results);
                })
                .onErrorResume(e -> {
                    System.out.println("Error occurred: " + e.getMessage());
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(Map.of("error", "Internal Server Error")));
                });
    }
}
