require('dotenv').config();

const {
    beforeAll,
    afterAll,
    beforeEach,
    afterEach,
    describe,
    it,
    expect
} = require('@jest/globals');

global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.describe = describe;
global.it = it;
global.expect = expect;

// Set default timeout for Pact tests
jest.setTimeout(30000);