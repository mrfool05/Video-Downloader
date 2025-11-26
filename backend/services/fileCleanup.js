// ========================================
// File Cleanup Service
// ========================================

const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

const TEMP_DIR = path.join(__dirname, '../temp');
const MAX_FILE_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Delete files older than MAX_FILE_AGE
 */
async function cleanupOldFiles() {
    try {
        console.log('🧹 Running file cleanup...');

        const files = await fs.readdir(TEMP_DIR);
        const now = Date.now();
        let deletedCount = 0;

        for (const file of files) {
            // Skip .gitkeep
            if (file === '.gitkeep') continue;

            const filePath = path.join(TEMP_DIR, file);

            try {
                const stats = await fs.stat(filePath);
                const fileAge = now - stats.mtimeMs;

                // Delete if older than 24 hours
                if (fileAge > MAX_FILE_AGE) {
                    await fs.unlink(filePath);
                    deletedCount++;
                    console.log(`   Deleted: ${file} (age: ${Math.floor(fileAge / 1000 / 60 / 60)} hours)`);
                }
            } catch (err) {
                console.error(`   Error processing ${file}:`, err.message);
            }
        }

        if (deletedCount > 0) {
            console.log(`✅ Cleanup complete: ${deletedCount} file(s) deleted`);
        } else {
            console.log('✅ Cleanup complete: No old files to delete');
        }
    } catch (err) {
        console.error('❌ Cleanup failed:', err);
    }
}

/**
 * Start the cron job for automatic cleanup
 * Runs every hour
 */
function startCleanupJob() {
    // Cron expression: every hour at minute 0
    // '0 * * * *' = at minute 0 of every hour
    cron.schedule('0 * * * *', () => {
        cleanupOldFiles();
    });

    console.log('File cleanup job scheduled (runs every hour)');

    // Also run immediately on startup
    setTimeout(cleanupOldFiles, 5000); // Run after 5 seconds
}

/**
 * Manual cleanup (for testing or manual trigger)
 */
async function runManualCleanup() {
    await cleanupOldFiles();
}

module.exports = {
    startCleanupJob,
    runManualCleanup,
    cleanupOldFiles,
};
