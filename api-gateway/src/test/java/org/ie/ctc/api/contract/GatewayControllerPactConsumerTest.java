package org.ie.ctc.api.contract;

import au.com.dius.pact.consumer.MockServer;
import au.com.dius.pact.consumer.dsl.PactDslWithProvider;
import au.com.dius.pact.consumer.junit5.PactConsumerTestExt;
import au.com.dius.pact.consumer.junit5.PactTestFor;
import au.com.dius.pact.core.model.V4Pact;
import au.com.dius.pact.core.model.annotations.Pact;
import org.ie.ctc.api.GatewayController;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "backend-service")
class GatewayControllerPactConsumerTest {

    private GatewayController gatewayController;

    private WebClient createWebClient(MockServer mockServer) {
        return WebClient.builder()
                .baseUrl(mockServer.getUrl())
                .build();
    }

    @Pact(consumer = "api-gateway", provider = "backend-service")
    V4Pact singleAppSearchPact(PactDslWithProvider builder) {
        return builder
                .given("apps exist")
                .uponReceiving("a request to search apps with single match")
                .method("GET")
                .path("/api/apps/search")
                .query("term=Two")
                .headers(Map.of("Accept", "application/json"))
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("""
                        [{
                            "appName": "appTwo",
                            "appData": {
                                "appPath": "/appSix",
                                "appOwner": "ownerOne",
                                "isValid": false
                            }
                        }]
                        """)
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "singleAppSearchPact")
    void singleAppSearchTest(MockServer mockServer) {
        WebClient webClient = createWebClient(mockServer);
        gatewayController = new GatewayController(webClient);

        StepVerifier.create(gatewayController.searchApps("Two"))
                .assertNext(response -> {
                    // Use a raw Object and explicitly cast with a safe check
                    Object responseBody = response.getBody();
                    assertThat(responseBody).isInstanceOf(List.class); // Ensure it’s a list first
                    List<?> rawResults = (List<?>) responseBody;

                    // Convert raw results into a strongly typed list
                    List<Map<String, Object>> results = rawResults.stream()
                            .map(item -> (Map<String, Object>) item) // Explicit cast for each item
                            .toList();

                    // Assertions
                    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                    assertThat(results).hasSize(1);
                    assertThat(results.get(0).get("appName")).isEqualTo("appTwo");
                })
                .verifyComplete();
    }

    @Pact(consumer = "api-gateway", provider = "backend-service")
    V4Pact multipleAppsSearchPact(PactDslWithProvider builder) {
        return builder
                .given("multiple apps exist")
                .uponReceiving("a request to search apps with multiple matches")
                .method("GET")
                .path("/api/apps/search")
                .query("term=app")
                .headers(Map.of("Accept", "application/json"))
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("""
                        [
                           {
                                   "appData": {
                                     "appOwner": "ownerOne",
                                     "appPath": "/appSix",
                                     "isValid": true
                                   },
                                   "appName": "appOne"
                                 },
                                 {
                                   "appData": {
                                     "appOwner": "ownerOne",
                                     "appPath": "/appSix",
                                     "isValid": false
                                   },
                                   "appName": "appTwo"
                                 },
                                 {
                                   "appData": {
                                     "appOwner": "ownerOne",
                                     "appPath": "/appSix",
                                     "isValid": true
                                   },
                                   "appName": "appThree"
                                 },
                                 {
                                   "appData": {
                                     "appOwner": "ownerOne",
                                     "appPath": "/appSix",
                                     "isValid": false
                                   },
                                   "appName": "appFour"
                                 },
                                 {
                                   "appData": {
                                     "appOwner": "ownerOne",
                                     "appPath": "/appSix",
                                     "isValid": true
                                   },
                                   "appName": "appFive"
                                 },
                                 {
                                   "appData": {
                                     "appOwner": "ownerOne",
                                     "appPath": "/appSix",
                                     "isValid": true
                                   },
                                   "appName": "appSix"
                                 }
                        ]
                        """)
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "multipleAppsSearchPact")
    void multipleAppsSearchTest(MockServer mockServer) {
        WebClient webClient = createWebClient(mockServer);
        gatewayController = new GatewayController(webClient);

        StepVerifier.create(gatewayController.searchApps("app"))
                .assertNext(response -> {
                    Object responseBody = response.getBody();
                    assertThat(responseBody).isInstanceOf(List.class);
                    List<?> rawResults = (List<?>) responseBody;

                    List<Map<String, Object>> results = rawResults.stream()
                            .map(item -> (Map<String, Object>) item)
                            .toList();

                    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                    assertThat(results).hasSizeGreaterThanOrEqualTo(2);
                })
                .verifyComplete();
    }

    @Pact(consumer = "api-gateway", provider = "backend-service")
    V4Pact noMatchingAppsSearchPact(PactDslWithProvider builder) {
        return builder
                .given("no apps match search term")
                .uponReceiving("a request to search non-existing apps")
                .method("GET")
                .path("/api/apps/search")
                .query("term=NonExistent")
                .headers(Map.of("Accept", "application/json"))
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("[]")
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "noMatchingAppsSearchPact")
    void noMatchingAppsSearchTest(MockServer mockServer) {
        WebClient webClient = createWebClient(mockServer);
        gatewayController = new GatewayController(webClient);

        StepVerifier.create(gatewayController.searchApps("NonExistent"))
                .assertNext(response -> {
                    Object responseBody = response.getBody();
                    assertThat(responseBody).isInstanceOf(List.class);
                    List<?> rawResults = (List<?>) responseBody;

                    List<Map<String, Object>> results = rawResults.stream()
                            .map(item -> (Map<String, Object>) item)
                            .toList();

                    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                    assertThat(results).isEmpty();
                })
                .verifyComplete();
    }

    @Pact(consumer = "api-gateway", provider = "backend-service")
    V4Pact serverErrorPact(PactDslWithProvider builder) {
        return builder
                .given("server error occurs")
                .uponReceiving("a request when server has internal error")
                .method("GET")
                .path("/api/apps/search")
                .query("term=%C3%28")
                .headers(Map.of("Accept", "application/json"))
                .willRespondWith()
                .status(500)
                .headers(Map.of("Content-Type", "application/json"))
                .body("""
                        {
                            "error": "Failed to search apps"
                        }
                        """)
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "serverErrorPact")
    void serverErrorTest(MockServer mockServer) {
        WebClient webClient = createWebClient(mockServer);
        gatewayController = new GatewayController(webClient);

        // Dynamically capture the mock server's base URL
        String expectedErrorMessage = "Internal Server Error: 500 Internal Server Error from GET " + mockServer.getUrl() + "/api/apps/search";

        StepVerifier.create(gatewayController.searchApps("%C3%28"))
                .assertNext(response -> {
                    // Validate the status code
                    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);

                    // Validate the response body as a List
                    Object responseBody = response.getBody();
                    assertThat(responseBody).isInstanceOf(List.class);

                    // Cast responseBody to List and check its contents
                    List<?> rawResults = (List<?>) responseBody;
                    assertThat(rawResults).hasSize(1);

                    // Extract the first map from the list and validate it
                    Map<String, Object> errorResponse = (Map<String, Object>) rawResults.get(0);
                    assertThat(errorResponse).containsEntry("error", expectedErrorMessage);
                })
                .verifyComplete();
    }
}
