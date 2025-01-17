const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/async.handler');

// Reset test data
router.post('/reset', asyncHandler(async (req, res) => {
    try {
        console.log('Setting test data:', JSON.stringify(req.body, null, 2));

        if (!Array.isArray(req.body)) {
            return res.status(400).json({ error: 'Test data must be an array' });
        }

        req.app.locals.testData = req.body;
        req.app.locals.isTestMode = true;
        req.app.locals.forceError = false;

        console.log(`Test state: mode=${req.app.locals.isTestMode}, forceError=${req.app.locals.forceError}`);

        res.status(200).json({ message: 'Test data set successfully' });
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({ error: error.message });
    }
}));

// Set error mode (need for emulating server issues scenarios)
router.post('/error-mode', asyncHandler(async (req, res) => {
    try {
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ error: 'enabled parameter must be a boolean' });
        }

        req.app.locals.forceError = enabled;
        res.status(200).json({ message: 'Error mode updated' });
    } catch (error) {
        console.error('Error mode update failed:', error);
        res.status(500).json({ error: error.message });
    }
}));

// Get test state
router.get('/state', asyncHandler(async (req, res) => {
    try {
        const state = {
            isTestMode: req.app.locals.isTestMode || false,
            forceError: req.app.locals.forceError || false,
            testDataCount: req.app.locals.testData ? req.app.locals.testData.length : 0
        };

        res.json(state);
    } catch (error) {
        console.error('Get state error:', error);
        res.status(500).json({ error: 'Failed to get test state' });
    }
}));

// Clear test state
router.post('/clear', asyncHandler(async (req, res) => {
    try {
        req.app.locals.testData = null;
        req.app.locals.isTestMode = false;
        req.app.locals.forceError = false;

        res.json({ message: 'Test state cleared' });
    } catch (error) {
        console.error('Clear state error:', error);
        res.status(500).json({ error: 'Failed to clear test state' });
    }
}));

module.exports = router;