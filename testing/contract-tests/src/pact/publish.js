const { Publisher } = require('@pact-foundation/pact');
require('dotenv').config();

const opts = {
    pactFilesOrDirs: ['./pacts'],
    pactBroker: process.env.PACT_BROKER_URL,
    pactBrokerToken: process.env.PACT_BROKER_TOKEN,
    consumerVersion: process.env.APP_VERSION || '1.0.0',
    branch: process.env.BRANCH || 'main',
    tags: process.env.TAGS ? process.env.TAGS.split(',') : ['test']
};

new Publisher(opts).publishPacts()
    .then(() => {
        console.log('Pact contract publishing complete!');
        console.log('');
        console.log('Head over to Pact Broker to see published contracts.');
    })
    .catch((e) => {
        console.log('Pact contract publishing failed: ', e);
        process.exit(1);
    });