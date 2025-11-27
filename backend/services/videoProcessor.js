const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const jobs = new Map();
let ytdlpPath = null;

function findYtDlp() {
    if (ytdlpPath) return ytdlpPath;
    const possiblePaths = ['yt-dlp', 'yt-dlp.exe', 'C:\\Program Files\\yt-dlp\\yt-dlp.exe'];
    for (const testPath of possiblePaths) {
        try {
            execSync(`"${testPath}" --version`, { stdio: 'ignore', timeout: 5000 });
            ytdlpPath = testPath;
            console.log(`✅ Found yt-dlp at: ${testPath}`);
            return testPath;
        } catch (err) {
            continue;
        }
    }
    return 'yt-dlp';
}

function sanitizeUrl(url) {
    try {
        const u = new URL(url);
        const paramsToRemove = ['si', 'feature', 'utm_source', 'utm_medium', 'utm_campaign'];
        paramsToRemove.forEach(p => u.searchParams.delete(p));
        return u.toString();
    } catch (e) {
        return url;
    }
}

async function getVideoMetadata(rawUrl) {
    const url = sanitizeUrl(rawUrl);
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');

    const executeFetch = (useCookies) => {
        return new Promise(async (resolve, reject) => {
            const args = ['--dump-single-json', '--flat-playlist', '--no-warnings', url];

            if (isYoutube) {
                args.splice(args.length - 1, 0, '--extractor-args', 'youtube:player_client=android');
            }

            let cookiePath = null;
            // Only use cookies for YouTube
            if (useCookies && isYoutube && process.env.COOKIES_CONTENT) {
                try {
                    const tempId = uuidv4();
                    const tempDir = path.join(__dirname, '../temp');
                    try { await fs.mkdir(tempDir, { recursive: true }); } catch (e) { }

                    cookiePath = path.join(tempDir, `cookies_meta_${tempId}.txt`);
                    await fs.writeFile(cookiePath, process.env.COOKIES_CONTENT);
                    args.splice(args.length - 1, 0, '--cookies', cookiePath);
                } catch (err) {
                    console.error('Failed to write cookie file:', err);
                }
            }

            console.log(`Fetching metadata for: ${url} (YouTube: ${isYoutube}, Cookies: ${!!cookiePath})`);
            const ytdlp = spawn(findYtDlp(), args);
            let stdout = '';
            let stderr = '';

            const timeout = setTimeout(() => {
                ytdlp.kill();
                if (cookiePath) fs.unlink(cookiePath).catch(() => { });
                reject(new Error('Metadata fetch timed out (30s limit)'));
            }, 30000);

            ytdlp.stdout.on('data', d => stdout += d);
            ytdlp.stderr.on('data', d => stderr += d);

            ytdlp.on('close', code => {
                clearTimeout(timeout);
                if (cookiePath) fs.unlink(cookiePath).catch(() => { });

                if (code !== 0) {
                    if (useCookies) {
                        return reject(new Error('RetryWithoutCookies'));
                    }
                    console.error(`Metadata fetch failed for ${url}. Exit code: ${code}`);
                    console.error(`Stderr: ${stderr}`);
                    return reject(new Error(stderr || 'Failed to fetch metadata'));
                }
                if (!stdout) return reject(new Error('No metadata received'));

                try {
                    const m = JSON.parse(stdout);
                    if (m._type === 'playlist' && m.entries) {
                        const videos = m.entries.map(entry => ({
                            title: entry.title, id: entry.id, duration: entry.duration,
                            uploader: entry.uploader, url: entry.url || `https://www.youtube.com/watch?v=${entry.id}`
                        }));
                        resolve({ type: 'playlist', title: m.title, count: m.entries.length, videos: videos });
                    } else {
                        resolve({
                            type: 'video', title: m.title, duration: m.duration, thumbnail: m.thumbnail,
                            uploader: m.uploader, view_count: m.view_count, description: m.description, url: url
                        });
                    }
                } catch (e) {
                    console.error('JSON Parse Error:', e);
                    reject(new Error('Parse error'));
                }
            });
        });
    };

    try {
        if (process.env.COOKIES_CONTENT) {
            return await executeFetch(true);
        } else {
            return await executeFetch(false);
        }
    } catch (error) {
        if (error.message === 'RetryWithoutCookies') {
            console.log('⚠️ Retrying without cookies...');
            return await executeFetch(false);
        }
        throw error;
    }
}

async function downloadVideo(rawUrl, format, quality, jobId) {
    const url = sanitizeUrl(rawUrl);
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    const tempDir = path.join(__dirname, '../temp');
    const outputPath = path.join(tempDir, `${jobId}.%(ext)s`);

    const args = ['--no-playlist', '-f', getFormatString(format, quality), '-o', outputPath,
        '--newline', '-N', '4', '--resize-buffer', '--force-ipv4', url];

    if (format === 'mp4') args.splice(3, 0, '--merge-output-format', 'mp4');
    if (quality === 'audio') args.splice(3, 0, '-x', '--audio-format', 'mp3');

    // Only add Android client for YouTube
    if (isYoutube) {
        args.splice(args.length - 1, 0, '--extractor-args', 'youtube:player_client=android');
    }

    // Only use cookies for YouTube
    let cookiePath = null;
    if (isYoutube && process.env.COOKIES_CONTENT) {
        try {
            cookiePath = path.join(tempDir, `cookies_${jobId}.txt`);
            await fs.writeFile(cookiePath, process.env.COOKIES_CONTENT);
            args.splice(args.length - 1, 0, '--cookies', cookiePath);
        } catch (err) {
            console.error('Failed to write cookie file:', err);
        }
    }

    return new Promise((resolve, reject) => {
        console.log(`[${jobId}] Starting download (YouTube: ${isYoutube}, Cookies: ${!!cookiePath})`);
        const ytdlp = spawn(findYtDlp(), args);

        ytdlp.stdout.on('data', data => {
            const output = data.toString();
            const m = output.match(/(\d+(?:\.\d+)?)%/);
            if (m) {
                const progress = Math.min(100, Math.floor(parseFloat(m[1])));
                updateJobProgress(jobId, progress, progress === 100 ? 'Finalizing...' : 'Downloading...');
            }
            if (output.includes('[Merger]') || output.includes('[Fixup]')) {
                updateJobProgress(jobId, 100, 'Converting & Merging...');
            }
        });

        ytdlp.stderr.on('data', data => {
            console.error(`[${jobId}] stderr:`, data.toString());
        });

        ytdlp.on('error', (err) => {
            console.error(`[${jobId}] Spawn error:`, err);
            updateJobStatus(jobId, 'failed');
            if (cookiePath) fs.unlink(cookiePath).catch(() => { });
            reject(new Error(`Failed to start download process: ${err.message}`));
        });

        ytdlp.on('close', async code => {
            console.log(`[${jobId}] Process exited with code ${code}`);
            if (cookiePath) fs.unlink(cookiePath).catch(() => { });

            if (code !== 0) {
                updateJobStatus(jobId, 'failed');
                return reject(new Error('Download failed'));
            }

            try {
                const files = await fs.readdir(tempDir);
                const file = files.find(f => f.startsWith(jobId));
                if (!file) {
                    updateJobStatus(jobId, 'failed');
                    return reject(new Error('File not found after download'));
                }
                updateJobComplete(jobId, file);
                resolve(path.join(tempDir, file));
            } catch (e) {
                updateJobStatus(jobId, 'failed');
                reject(e);
            }
        });
    });
}

function getFormatString(format, quality) {
    if (quality === 'audio') return 'bestaudio';
    const h = { '1080': '1080', '720': '720', '480': '480' }[quality] || '720';
    return `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`;
}

function createJob(url, format, quality) {
    const jobId = uuidv4();
    jobs.set(jobId, { id: jobId, url, format, quality, status: 'queued', progress: 0, statusText: 'Queued...', downloadUrl: null, createdAt: Date.now() });
    processJob(jobId);
    return jobId;
}

async function processJob(jobId) {
    const job = jobs.get(jobId);
    if (!job) return;
    try {
        updateJobProgress(jobId, 0, 'Starting...');
        await downloadVideo(job.url, job.format, job.quality, jobId);
    } catch (e) {
        console.error(`Job ${jobId} failed:`, e);
        updateJobStatus(jobId, 'failed');
    }
}

function updateJobProgress(jobId, progress, statusText) {
    const job = jobs.get(jobId);
    if (job) { job.progress = progress; job.statusText = statusText; job.status = 'processing'; }
}

function updateJobStatus(jobId, status) {
    const job = jobs.get(jobId);
    if (job) job.status = status;
}

function updateJobComplete(jobId, filename) {
    const job = jobs.get(jobId);
    if (job) {
        job.status = 'ready';
        job.progress = 100;
        job.statusText = 'Ready';
        job.downloadUrl = `/api/download/${filename}`;
    }
}

function getJobStatus(jobId) {
    const job = jobs.get(jobId);
    return job ? { status: job.status, progress: job.progress, statusText: job.statusText, downloadUrl: job.downloadUrl } : null;
}

setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs.entries()) {
        if (now - job.createdAt > 86400000) jobs.delete(id);
    }
}, 3600000);

module.exports = { getVideoMetadata, createJob, getJobStatus };
