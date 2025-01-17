const { describe, it, expect } = require('@jest/globals');

const axios = require('axios');
const appsData = require('../fixtures/apps.test.json');
const { createMockProvider, createClient } = require('../utils/test.helpers');

describe('Frontend Consumer of Backend Test', () => {
    const mockProvider = createMockProvider('frontend-webapp', 'backend-service', 1234);

    describe('GET /api/apps', () => {
        it('returns complete apps list', async () => {
            await mockProvider
                .given('apps exist')
                .uponReceiving('a request for all apps')
                .withRequest({
                    method: 'GET',
                    path: '/api/apps',
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: appsData
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = axios.create({
                    baseURL: mockserver.url,
                    headers: {
                        Accept: 'application/json'
                    }
                });
                const response = await client.get('/api/apps');
                expect(response.status).toBe(200);
                expect(response.data).toEqual(appsData);
            });
        });
    });

    describe('GET /api/apps/search', () => {
        it('returns matching apps correctly', async () => {
            await mockProvider
                .given('apps exist')
                .uponReceiving('a request to search apps')
                .withRequest({
                    method: 'GET',
                    path: '/api/apps/search',
                    headers: {
                        Accept: 'application/json'
                    },
                    query: {
                        term: 'Two'
                    }
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: [{
                        appName: "appTwo",
                        appData: {
                            appPath: "/appSix",
                            appOwner: "ownerOne",
                            isValid: false
                        }
                    }]
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
                expect(response.data).toEqual([appsData[1]]);
            });
        });
    });

    describe('PUT /api/apps/:appName', () => {
        it('returns error when trying to update immutable appPath field', async () => {
            const invalidUpdate = {
                appName: "appTwo",
                appData: {
                    appPath: "/newPath",
                    appOwner: "ownerOne",
                    isValid: false
                }
            };

            await mockProvider
                .given('app exists')
                .uponReceiving('a request to update immutable appPath field')
                .withRequest({
                    method: 'PUT',
                    path: '/api/apps/appTwo',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: invalidUpdate
                })
                .willRespondWith({
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: 'appPath cannot be modified'
                    }
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = createClient(mockserver, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const response = await client.put('/api/apps/appTwo', invalidUpdate);
                expect(response.status).toBe(400);
                expect(response.data).toEqual({
                    error: 'appPath cannot be modified'
                });
            });
        });

        it('returns error when trying to update immutable appName field', async () => {
            const invalidUpdate = {
                appName: "newAppName",  // Trying to change appName
                appData: {
                    appPath: "/appTwo",
                    appOwner: "ownerOne",
                    isValid: false
                }
            };

            await mockProvider
                .given('app exists')
                .uponReceiving('a request to update immutable appName field')
                .withRequest({
                    method: 'PUT',
                    path: '/api/apps/appTwo',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: invalidUpdate
                })
                .willRespondWith({
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: 'appName cannot be modified'
                    }
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = createClient(mockserver, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const response = await client.put('/api/apps/appTwo', invalidUpdate);
                expect(response.status).toBe(400);
                expect(response.data).toEqual({
                    error: 'appName cannot be modified'
                });
            });
        });
    });

    describe('DELETE /api/apps/:appName', () => {
        it('returns not found when deleting non-existent app', async () => {
            await mockProvider
                .given('app does not exist')
                .uponReceiving('a request to delete non-existent app')
                .withRequest({
                    method: 'DELETE',
                    path: '/api/apps/nonexistent',
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .willRespondWith({
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: 'App not found'
                    }
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = axios.create({
                    baseURL: mockserver.url,
                    headers: {
                        Accept: 'application/json'
                    },
                    validateStatus: status => status < 500
                });
                const response = await client.delete('/api/apps/nonexistent');
                expect(response.status).toBe(404);
                expect(response.data).toEqual({
                    error: 'App not found'
                });
            });
        });

        it('successfully deletes an existing app', async () => {
            await mockProvider
                .given('app exists')
                .uponReceiving('a request to delete existing app')
                .withRequest({
                    method: 'DELETE',
                    path: '/api/apps/appTwo',
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .willRespondWith({
                    status: 204
                });

            await mockProvider.executeTest(async (mockserver) => {
                const client = axios.create({
                    baseURL: mockserver.url,
                    headers: {
                        Accept: 'application/json'
                    }
                });
                const response = await client.delete('/api/apps/appTwo');
                expect(response.status).toBe(204);
                expect(response.data).toBe(''); // axios returns empty string for 204 responses
            });
        });
    });
});