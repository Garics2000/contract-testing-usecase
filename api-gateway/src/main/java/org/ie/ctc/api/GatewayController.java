package org.ie.ctc.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gateway/apps")
public class GatewayController {
    private final WebClient webClient;

    public GatewayController(WebClient webClient) {
        this.webClient = webClient;
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<? extends List<? extends Map>>> searchApps(@RequestParam String term) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/apps/search").queryParam("term", term).build())
                .header("Accept", "application/json")
                .retrieve()
                .bodyToFlux(Map.class)
                .collectList()
                .map(results -> {
                    if (results.isEmpty()) {
                        // Return 404 Not Found when no results are found
                        return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(List.of(Map.of("message", "No results found for search term: " + term)));
                    }
                    return ResponseEntity.ok(results);
                })
                .onErrorResume(e -> {
                    System.out.println("Error occurred: " + e.getMessage());
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(List.of(Map.of("error", "Internal Server Error: " + e.getMessage()))));
                });
    }
}