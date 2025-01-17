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
    public Mono<ResponseEntity<List<Map>>> searchApps(@RequestParam String term) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/apps/search").queryParam("term", term).build())
                .header("Accept", "application/json") // Ensure the Accept header matches the contract
                .retrieve()
                .bodyToFlux(Map.class)
                .collectList()
                .map(results -> {
                    if (results.isEmpty()) {
                        // Return 200 OK with an empty body if no results are found
                        return ResponseEntity.ok(results);
                    }
                    return ResponseEntity.ok(results);
                })
                .onErrorResume(e -> {
                    System.out.println("Error occurred: " + e.getMessage());
                    // Wrap the error in a List<Map>
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(List.of(Map.of("error", "Internal Server Error: " + e.getMessage()))));
                });
    }
}
