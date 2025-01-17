const { PactV3 } = require('@pact-foundation/pact');
const { describe, it, expect } = require('@jest/globals');
const axios = require('axios');
const {createMockProvider} = require("../utils/test.helpers");

describe('API Gateway Consumer', () => {
    const mockProvider = createMockProvider('api-gateway', 'backend-service', 1236);

    describe('GET /api/apps/search', () => {
        it('returns matching apps for a single result', async () => {
            const expectedResponse = [{
                appName: "appTwo",
                appData: {
                    appPath: "/appSix",
                    appOwner: "ownerOne",
                    isValid: false
                }
            }];

            await mockProvider
                .given('apps exist')
                .uponReceiving('a request to search apps with single match')
                .withRequest({
                    method: 'GET',
                    path: '/api/apps/search',
                    query: {
                        term: 'Two'
                    },
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: expectedResponse
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = axios.create({
                    baseURL: mockserver.url,
                    headers: {
                        Accept: 'application/json'
                    }
                });
                const response = await client.get('/api/apps/search?term=Two');
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResponse);
            });
        });

        it('returns multiple matching apps', async () => {
            const expectedResponse = require('../fixtures/apps.test.json');

            await mockProvider
                .given('multiple apps exist')
                .uponReceiving('a request to search apps with multiple matches')
                .withRequest({
                    method: 'GET',
                    path: '/api/apps/search',
                    query: {
                        term: 'app'
                    },
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: expectedResponse
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = axios.create({
                    baseURL: mockserver.url,
                    headers: {
                        Accept: 'application/json'
                    }
                });
                const response = await client.get('/api/apps/search?term=app');
                expect(response.status).toBe(200);
                expect(response.data.length).toBeGreaterThanOrEqual(2);
            });
        });

        it('returns empty array when no apps match search term', async () => {
            await mockProvider
                .given('no apps match search term')
                .uponReceiving('a request to search non-existing apps')
                .withRequest({
                    method: 'GET',
                    path: '/api/apps/search',
                    query: {
                        term: 'NonExistent'
                    },
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: []
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = axios.create({
                    baseURL: mockserver.url,
                    headers: {
                        Accept: 'application/json'
                    }
                });
                const response = await client.get('/api/apps/search?term=NonExistent');
                expect(response.status).toBe(200);
                expect(response.data).toEqual([]);
            });
        });

        it('handles server errors gracefully', async () => {
            await mockProvider
                .given('server error occurs')
                .uponReceiving('a request when server has internal error')
                .withRequest({
                    method: 'GET',
                    path: '/api/apps/search',
                    query: {
                        term: '%C3%28'
                    },
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .willRespondWith({
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: 'Failed to search apps'
                    }
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = axios.create({
                    baseURL: mockserver.url,
                    headers: {
                        Accept: 'application/json'
                    },
                    validateStatus: status => true
                });
                const response = await client.get('/api/apps/search?term=%C3%28');
                expect(response.status).toBe(500);
            });
        });

        it('handles missing search term parameter', async () => {
            await mockProvider
                .given('search term is missing')
                .uponReceiving('a request without search term')
                .withRequest({
                    method: 'GET',
                    path: '/api/apps/search',
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: [] // Based on your backend implementation that treats empty term as empty result
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = axios.create({
                    baseURL: mockserver.url,
                    headers: {
                        Accept: 'application/json'
                    }
                });
                const response = await client.get('/api/apps/search');
                expect(response.status).toBe(200);
                expect(response.data).toEqual([]);
            });
        });
    });
});