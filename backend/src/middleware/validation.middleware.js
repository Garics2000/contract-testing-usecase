const { AppError } = require('../utils/errors/AppError');

/**
 * Validates string fields with common rules
 * @param {string} value - The value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} options - Validation options
 * @throws {AppError} If validation fails
 */
const validateString = (value, fieldName, options = {}) => {
    const {
        minLength = 1,
        maxLength = 255,
        required = true,
        pattern = null
    } = options;

    if (!value && required) {
        throw new AppError(`${fieldName} is required`, 400);
    }

    if (value) {
        if (typeof value !== 'string') {
            throw new AppError(`${fieldName} must be a string`, 400);
        }

        const trimmed = value.trim();

        if (trimmed.length < minLength) {
            throw new AppError(`${fieldName} must be at least ${minLength} characters`, 400);
        }

        if (trimmed.length > maxLength) {
            throw new AppError(`${fieldName} cannot exceed ${maxLength} characters`, 400);
        }

        if (pattern && !pattern.test(trimmed)) {
            throw new AppError(`${fieldName} format is invalid`, 400);
        }
    }
};

/**
 * Validates the structure and content of appData object
 * @param {Object} appData - The appData object to validate
 * @throws {AppError} If validation fails
 */
const validateAppData = (appData) => {
    if (!appData || typeof appData !== 'object') {
        throw new AppError('appData must be an object', 400);
    }

    // Required fields validation
    validateString(appData.appPath, 'appPath', {
        pattern: /^\/[a-zA-Z0-9\-_\/]+$/,  // Must start with / and contain only allowed characters
        minLength: 2,
        maxLength: 100
    });

    validateString(appData.appOwner, 'appOwner', {
        pattern: /^[a-zA-Z0-9\-_]+$/,
        minLength: 2,
        maxLength: 100
    });

    // Validate isValid field
    if (typeof appData.isValid !== 'boolean') {
        throw new AppError('isValid must be a boolean value', 400);
    }

    // Validate no unexpected fields are present
    const allowedFields = ['appPath', 'appOwner', 'isValid'];
    const unexpectedFields = Object.keys(appData).filter(
        field => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
        throw new AppError(
            `Unexpected fields in appData: ${unexpectedFields.join(', ')}`,
            400
        );
    }
};

/**
 * Middleware to validate app creation/update requests
 */
const validateApp = (req, res, next) => {
    try {
        const { appName, appData } = req.body;

        // Validate appName
        validateString(appName, 'appName', {
            minLength: 3,
            maxLength: 50,
            pattern: /^[a-zA-Z0-9\-_]+$/
        });

        // Validate appData structure and content
        validateAppData(appData);

        // Add sanitized data to request
        req.validatedData = {
            appName: appName.trim(),
            appData: {
                appPath: appData.appPath.trim(),
                appOwner: appData.appOwner.trim(),
                isValid: appData.isValid
            }
        };

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to validate search parameters
 */
const validateSearch = (req, res, next) => {
    try {
        const { term } = req.query;

        if (!term) {
            return next();
        }

        validateString(term, 'search term', {
            minLength: 1,
            maxLength: 100,
            required: false,
            pattern: /^[a-zA-Z0-9\-_ ]+$/
        });

        // Add sanitized search term to request
        req.validatedSearch = term.trim();
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateApp,
    validateSearch,
    // Export for testing
    validateString,
    validateAppData
};