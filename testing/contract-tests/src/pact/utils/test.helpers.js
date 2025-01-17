const { PactV3, Verifier } = require('@pact-foundation/pact');
const axios = require('axios');

const createMockProvider = (consumer, provider, port) => {
    return new PactV3({
        consumer,
        provider,
        port,
        dir: './pacts',
        logLevel: 'warn'
    });
};

const createProviderVerifier = (providerName, providerBaseUrl, stateHandlers = {}) => {
    if (!providerBaseUrl) {
        throw new Error(`Provider base URL is required for ${providerName}`);
    }

    return new Verifier({
        provider: providerName,
        providerBaseUrl,
        pactBrokerUrl: process.env.PACT_BROKER_URL || 'http://localhost:9292',
        publishVerificationResult: true,
        providerVersion: process.env.APP_VERSION || '1.0.0',
        consumerVersionSelectors: [
            { latest: true }
        ],
        stateHandlers,
        verbose: process.env.VERBOSE === 'true',
        logLevel: process.env.LOG_LEVEL || 'INFO'
    });
};

const createClient = (mockserver, options = {}) => axios.create({
    baseURL: mockserver.url,
    headers: {
        Accept: 'application/json',
        ...options.headers
    },
    validateStatus: options.validateStatus || (status => status < 500),
    ...options
});

module.exports = {
    createMockProvider,
    createProviderVerifier,
    createClient
};