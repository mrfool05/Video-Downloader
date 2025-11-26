// ========================================
// Puppeteer Video Extractor Service
// ========================================

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * Extract video URL from adult sites using Puppeteer
 */
async function extractVideoUrl(pageUrl) {
    console.log('🌐 Using Puppeteer to extract video from:', pageUrl);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });

    try {

        // If we found a direct video URL
        if (videoData.videoUrl) {
            return {
                success: true,
                videoUrl: videoData.videoUrl,
                title: videoData.title || 'Unknown Title',
                thumbnail: videoData.thumbnail || videoData.poster,
                sources: videoData.sources
            };
        }

        // If no direct URL found, try to intercept network requests
        console.log('⚠️ No direct video URL found, intercepting network...');

        const videoUrls = [];

        page.on('response', async (response) => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';

            // Check if it's a video file
            if (contentType.includes('video/') || url.includes('.mp4') || url.includes('.m3u8')) {
                videoUrls.push({
                    url,
                    contentType,
                    status: response.status()
                });
            }
        });

        // Trigger video playback
        await page.evaluate(() => {
            const video = document.querySelector('video');
            if (video) {
                video.play().catch(() => { });
            }

            // Try clicking play button
            const playButton = document.querySelector('.play-button, [class*="play"], button[aria-label*="play" i]');
            if (playButton) {
                playButton.click();
            }
        });

        // Wait for network activity
        await page.waitForTimeout(5000);

        if (videoUrls.length > 0) {
            console.log(`✅ Found ${videoUrls.length} video URLs from network`);
            return {
                success: true,
                videoUrl: videoUrls[0].url,
                title: videoData.title || 'Unknown Title',
                thumbnail: videoData.thumbnail,
                allUrls: videoUrls
            };
        }

        throw new Error('Could not extract video URL from page');

    } finally {
        await browser.close();
    }
}

/**
 * Get video metadata using Puppeteer
 */
async function getMetadata(pageUrl) {
    try {
        const data = await extractVideoUrl(pageUrl);

        return {
            title: data.title,
            thumbnail: data.thumbnail,
            duration: null, // Will be determined during download
            uploader: 'Unknown',
            view_count: null,
            description: null,
            direct_url: data.videoUrl
        };
    } catch (error) {
        console.error('Puppeteer metadata extraction failed:', error);
        throw error;
    }
}

module.exports = {
    extractVideoUrl,
    getMetadata
};
