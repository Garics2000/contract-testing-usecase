const { createProviderVerifier } = require('../utils/test.helpers');
const axios = require('axios');

describe('API Gateway Provider Verification', () => {
    const baseURL = process.env.API_GATEWAY_URL;
    const api = axios.create({
        baseURL,
        validateStatus: () => true
    });

    it('validates the expectations of external client', async () => {
        const verifier = createProviderVerifier(
            'api-gateway',
            process.env.API_GATEWAY_URL
        );

        return verifier.verifyProvider()
            .catch(error => {
                console.error('Verification Error:', error);
                throw error;
            });
    });
});