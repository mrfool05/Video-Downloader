// ========================================
// URL Validator Service
// ========================================

/**
 * Validate if a URL is properly formatted and potentially supported
 */
function validateUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') {
        return {
            valid: false,
            error: 'URL is required',
        };
    }

    // Check if it's a valid URL format
    try {
        const url = new URL(urlString);

        // Only allow http and https
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return {
                valid: false,
                error: 'Only HTTP and HTTPS URLs are supported',
            };
        }

        // Check if hostname exists
        if (!url.hostname) {
            return {
                valid: false,
                error: 'Invalid URL format',
            };
        }

        return {
            valid: true,
            url: url.href,
        };

    } catch (err) {
        return {
            valid: false,
            error: 'Invalid URL format',
        };
    }
}

/**
 * Optional: Check if URL is from a supported platform
 * This is a basic implementation - yt-dlp supports 1000+ sites
 */
function isSupportedPlatform(urlString) {
    // Common video platforms (yt-dlp supports many more)
    const supportedDomains = [
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'dailymotion.com',
        'twitter.com',
        'x.com',
        'tiktok.com',
        'facebook.com',
        'instagram.com',
        'twitch.tv',
        'reddit.com',
        // Add more as needed
    ];

    try {
        const url = new URL(urlString);
        const hostname = url.hostname.replace('www.', '');

        // Check if any supported domain is in the hostname
        return supportedDomains.some(domain => hostname.includes(domain));
    } catch (err) {
        return false;
    }
}

module.exports = {
    validateUrl,
    isSupportedPlatform,
};
