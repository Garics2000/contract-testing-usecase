
const { createProviderVerifier } = require('../utils/test.helpers');
const axios = require('axios');
const appsData = require('../fixtures/apps.test.json');

describe('Backend Provider Verification', () => {
    // Make sure we're using the correct backend URL from env
    const baseURL = process.env.BACKEND_URL;
    const api = axios.create({
        baseURL,
        validateStatus: () => true // Accept any status code for testing
    });

    // Reset error mode and data before tests
    beforeAll(async () => {
        process.env.NODE_ENV = 'test'; // Ensure test endpoints are available
        await api.post('/api/test/error-mode', { enabled: false });
        await api.post('/api/test/reset', appsData);
    });

    afterEach(async () => {
        // Reset all state after each test
        await api.post('/api/test/error-mode', { enabled: false });
        await api.post('/api/test/reset', appsData);
    });

    const stateHandlers = {
        'apps exist': async () => {
            await api.post('/api/test/reset', appsData);
        },
        'app exists': async () => {
            await api.post('/api/test/reset', appsData);
        },
        'app does not exist': async () => {
            await api.post('/api/test/reset', []);
        },
        'multiple apps exist': async () => {
            await api.post('/api/test/reset', appsData);
        },
        'no apps match the search criteria': async () => {
            await api.post('/api/test/reset', []);
        },
        'server error occurs': async () => {
            await api.post('/api/test/error-mode', { enabled: true });
        },
        'search term is missing': async () => {
            await api.post('/api/test/reset', []);
        },
        'server is experiencing issues': async () => {
            await api.post('/api/test/error-mode', { enabled: true });
        }
    };

    // Reset after each test
    afterEach(async () => {
        await api.post('/api/test/error-mode', { enabled: false });
        await api.post('/api/test/reset', appsData);
    });

    it('validates the expectations of frontend-webapp and api-gateway', async () => {
        const verifier = createProviderVerifier(
            'backend-service',
            process.env.BACKEND_URL,
            stateHandlers
        );

        return verifier.verifyProvider()
            .catch(error => {
                console.error('Verification Error:', error);
                throw error;
            });
    });
});