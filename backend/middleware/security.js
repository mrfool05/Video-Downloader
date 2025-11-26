// ========================================
// Security Middleware
// ========================================

/**
 * Sanitize input to prevent XSS and injection attacks
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }

    // Remove any HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>'"]/g, '');

    return sanitized.trim();
}

/**
 * Validate URL format
 */
function isValidUrl(urlString) {
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

/**
 * Input validation middleware
 */
function validateInput(req, res, next) {
    // Sanitize all string inputs in body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeInput(req.body[key]);
            }
        });
    }

    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeInput(req.query[key]);
            }
        });
    }

    next();
}

module.exports = {
    sanitizeInput,
    isValidUrl,
    validateInput,
};
