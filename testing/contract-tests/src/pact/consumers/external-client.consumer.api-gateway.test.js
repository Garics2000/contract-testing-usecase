const { PactV3 } = require('@pact-foundation/pact');
const { describe, it, expect } = require('@jest/globals');
const axios = require('axios');
const {createMockProvider} = require("../utils/test.helpers");

describe('External Client Consumer of Api Gateway Test', () => {
    const mockProvider = createMockProvider('external-client', 'api-gateway', 1235);

    describe('GET /api/gateway/apps/search', () => {
        it('returns matching single app when searching with term', async () => {
            const expectedResponse = [
                {
                    appName: "appTwo",
                    appData: {
                        appPath: "/appSix",
                        appOwner: "ownerOne",
                        isValid: false
                    }
                }
            ];

            await mockProvider
                .given('apps exist in the system')
                .uponReceiving('a request to search apps through API Gateway')
                .withRequest({
                    method: 'GET',
                    path: '/api/gateway/apps/search',
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

                const response = await client.get('/api/gateway/apps/search?term=Two');
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResponse);
            });
        });

        it('returns multiple matching apps when search term matches several entries', async () => {
            const expectedResponse = require('../fixtures/apps.test.json');

            await mockProvider
                .given('multiple apps exist matching the search criteria')
                .uponReceiving('a request to search apps with multiple matches')
                .withRequest({
                    method: 'GET',
                    path: '/api/gateway/apps/search',
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

                const response = await client.get('/api/gateway/apps/search?term=app');
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResponse);
                expect(response.data.length).toBeGreaterThan(1);
                // Verify that all returned apps match the search criteria
                expect(response.data.every(app =>
                    app.appName.includes('app') || app.appData.appOwner.includes('owner')
                )).toBe(true);
            });
        });

        it('returns 404 when no apps match the search term', async () => {
            await mockProvider
                .given('no apps match the search criteria')
                .uponReceiving('a request to search non-existing apps')
                .withRequest({
                    method: 'GET',
                    path: '/api/gateway/apps/search',
                    query: {
                        term: 'NonExistent'
                    },
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .willRespondWith({
                    status: 404
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = axios.create({
                    baseURL: mockserver.url,
                    headers: {
                        Accept: 'application/json'
                    },
                    validateStatus: status => status < 500
                });

                const response = await client.get('/api/gateway/apps/search?term=NonExistent');
                expect(response.status).toBe(404);
            });
        });
    });
});