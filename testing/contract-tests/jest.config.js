module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/jest.setup.js'],
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)'
    ],
    moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
    verbose: true,
    testTimeout: 30000, // Pact tests might need more time
    roots: ['<rootDir>/src'],
    testPathIgnorePatterns: ['/node_modules/']
};