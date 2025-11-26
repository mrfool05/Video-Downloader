// ========================================
// Rate Limiter Middleware
// ========================================

const rateLimit = require('express-rate-limit');

// Create rate limiter
// 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting for static files
    skip: (req) => {
        return req.path.startsWith('/css') ||
            req.path.startsWith('/js') ||
            req.path.startsWith('/pages');
    },
});

module.exports = limiter;
