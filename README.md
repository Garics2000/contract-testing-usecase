# Contract Testing Example

A project example of implementing Pact contract testing tool.

## Prerequisites

- Docker and Docker Compose
- Node.js v17
- npm

## Project Structure

```
.
├── api-gateway/        # Spring Boot API Gateway
├── backend/            # Express.js Backend Service
├── frontend/           # React Frontend (Added solely for demonstration purposes, it is not required for running tests.)
├── testing/
│   └── contract-tests/ # Pact Contract Tests project
└── docker-compose.yml
```
## Setup
### 1. Build and run the services
Run the following command:
```bash
docker-compose up -d
```
The services will be up and running by the following urls:
```
Frontend:     http://localhost:3000
Backend:      http://localhost:3001
API Gateway:  http://localhost:8080
Pact Broker:  http://localhost:9292
```


### 2. Environment variables
Setup The following environment variables to run the tests:

```env
PACT_BROKER_URL=http://localhost:9292
PROVIDER_URL=http://localhost:3001
API_GATEWAY_URL=http://localhost:8080
```

## Run tests
### 1. Run consumer tests

Navigate to the contract tests directory and install dependencies:

```bash
cd testing/contract-tests
npm install
```

Run the consumer tests to generate pacts:

```bash
# Run consumer tests
npm run test:consumer

# The pacts will be generated in testing/contract-tests/pacts/
```

### 2. Publish pacts to the broker

After generating the pacts, publish them to the Pact Broker:

```bash
npm run publish:pacts
```

You can verify the published pacts by visiting http://localhost:9292

### 4. Run provider tests

First, ensure the backend service is running on http://localhost:3001. Then run the provider verification tests:
```bash
npm run test:provider
```

## Deployment readiness validation
```bash
npm run can-deploy:provider
npm run can-deploy:consumer
```

