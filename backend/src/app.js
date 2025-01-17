require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Routes
const appRoutes = require('./routes/app.routes');
const testRoutes = require('./routes/test.routes');

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));

app.locals.testData = null;
app.locals.isTestMode = false;
app.locals.forceError = false;

// Test routes only available in test environment
if (process.env.NODE_ENV === 'test') {
    app.use('/api/test', testRoutes);
}

// Add middleware to check forceError before all routes
app.use((req, res, next) => {
    if (app.locals.forceError) {
        return res
            .status(500)
            .header('Content-Type', 'application/json')
            .json({ error: 'Failed to search apps' });
    }
    next();
});

// Default API routes
app.use('/api/apps', appRoutes);

// Errors handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;