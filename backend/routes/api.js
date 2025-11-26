// ========================================
// API Routes
// ========================================

const express = require('express');
const path = require('path');
const router = express.Router();
const { validateUrl } = require('../services/urlValidator');
const { getVideoMetadata, createJob, getJobStatus } = require('../services/videoProcessor');
const { validateInput } = require('../middleware/security');

// Apply input validation to all routes
router.use(validateInput);

// ========================================
// POST /api/validate
// Validate URL and fetch video metadata
// ========================================
router.post('/validate', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                valid: false,
                error: 'URL is required',
            });
        }

        // Validate URL format
        const validation = validateUrl(url);
        if (!validation.valid) {
            return res.status(400).json({
                valid: false,
                error: validation.error,
            });
        }

        // Fetch video metadata using yt-dlp
        try {
            const metadata = await getVideoMetadata(url);

            return res.json({
                valid: true,
                metadata,
            });
        } catch (err) {
            console.error('Metadata fetch error:', err);
            return res.status(400).json({
                valid: false,
                error: 'Invalid or unsupported video URL. Please ensure the URL is correct and the video is publicly accessible.',
            });
        }
    } catch (err) {
        console.error('Validation error:', err);
        return res.status(500).json({
            valid: false,
            error: 'Server error. Please try again later.',
        });
    }
});

// ========================================
// POST /api/download
// Start a download job
// ========================================
router.post('/download', async (req, res) => {
    try {
        const { url, format, quality } = req.body;

        // Validate inputs
        if (!url) {
            return res.status(400).json({
                error: 'URL is required',
            });
        }

        if (!format || !['mp4', 'webm'].includes(format)) {
            return res.status(400).json({
                error: 'Invalid format. Must be mp4 or webm',
            });
        }

        if (!quality || !['1080', '720', '480', 'audio'].includes(quality)) {
            return res.status(400).json({
                error: 'Invalid quality. Must be 1080, 720, 480, or audio',
            });
        }

        // Validate URL
        const validation = validateUrl(url);
        if (!validation.valid) {
            return res.status(400).json({
                error: validation.error,
            });
        }

        // Create download job
        const jobId = createJob(url, format, quality);

        return res.json({
            jobId,
            message: 'Download started',
        });

    } catch (err) {
        console.error('Download error:', err);
        return res.status(500).json({
            error: 'Failed to start download. Please try again.',
        });
    }
});

// ========================================
// GET /api/status/:jobId
// Get download job status
// ========================================
router.get('/status/:jobId', (req, res) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({
                error: 'Job ID is required',
            });
        }

        const status = getJobStatus(jobId);

        if (!status) {
            return res.status(404).json({
                error: 'Job not found. It may have expired.',
            });
        }

        return res.json(status);

    } catch (err) {
        console.error('Status check error:', err);
        return res.status(500).json({
            error: 'Failed to get job status',
        });
    }
});

// ========================================
// GET /api/download/:filename
// Serve downloaded file
// ========================================
router.get('/download/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        // Security: Prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                error: 'Invalid filename',
            });
        }

        const filePath = path.join(__dirname, '../temp', filename);

        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: 'File not found or has expired',
            });
        }

        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Stream the file
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('File send error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: 'Failed to download file',
                    });
                }
            }
        });

    } catch (err) {
        console.error('Download file error:', err);
        return res.status(500).json({
            error: 'Failed to download file',
        });
    }
});

module.exports = router;
