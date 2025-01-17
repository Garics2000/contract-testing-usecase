const express = require('express');

/**
 * @type {express.ErrorRequestHandler}
 */
const errorHandler = (err, req, res, next) => {
    // Always log the error
    console.error('Error:', err);

    return res
        .status(500)
        .header('Content-Type', 'application/json')
        .json({
            error: err.message || 'Internal server error'
        });
};

/**
 * @type {express.RequestHandler}
 */
const notFoundHandler = (req, res) => {
    return res
        .status(404)
        .header('Content-Type', 'application/json')
        .json({
            error: `Route not found: ${req.originalUrl}`
        });
};

module.exports = {
    errorHandler,
    notFoundHandler
};