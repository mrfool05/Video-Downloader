// ========================================
// Bippi Downloader - Main Server
// ========================================

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimiter = require('./middleware/rateLimiter');
const apiRoutes = require('./routes/api');
const { startCleanupJob } = require('./services/fileCleanup');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// Middleware
// ========================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development, enable in production
}));

// CORS configuration
app.use(cors({
    origin: '*', // In production, specify actual frontend domain
    methods: ['GET', 'POST'],
    credentials: false,
}));

// Parse JSON bodies
app.use(express.json());

// Rate limiting - apply to all routes
app.use(rateLimiter);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// ========================================
// API Routes
// ========================================

app.use('/api', apiRoutes);

// ========================================
// Frontend Routes
// ========================================

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve legal pages
app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/terms.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/privacy.html'));
});

app.get('/dmca', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dmca.html'));
});

// ========================================
// Error Handling
// ========================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 Bippi Downloader Server Running`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('========================================');

    // Start file cleanup cron job
    startCleanupJob();
    console.log('🧹 File cleanup job started (runs every hour)');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
