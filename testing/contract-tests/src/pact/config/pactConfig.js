const path = require('path');

const pactConfig = {
    consumer: {
        dir: path.resolve(__dirname, '../../../pacts'),
        pactfileWriteMode: 'merge',
        log: path.resolve(__dirname, '../../../logs/pact.log'),
        logLevel: process.env.LOG_LEVEL || 'INFO'
    },
    provider: {
        port: 8080,
        pactBrokerUrl: process.env.PACT_BROKER_URL,
        pactBrokerToken: process.env.PACT_BROKER_TOKEN,
        publishVerificationResult: true
    }
};

module.exports = pactConfig;