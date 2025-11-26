// ========================================
// Bippi Downloader - Frontend Logic
// ========================================

const API_URL = '/api'; // Relative URL for flexibility

// DOM Elements
const themeToggle = document.getElementById('themeToggle');

const videoUrlInput = document.getElementById('videoUrl');
const validateBtn = document.getElementById('validateBtn');
const errorMessage = document.getElementById('errorMessage');

const videoPreview = document.getElementById('videoPreview');
const thumbnailImg = document.getElementById('thumbnailImg');
const videoTitle = document.getElementById('videoTitle');
const videoDuration = document.getElementById('videoDuration');
const videoMeta = document.getElementById('videoMeta');

const playlistSection = document.getElementById('playlistSection');
const playlistTitle = document.getElementById('playlistTitle');
const playlistItems = document.getElementById('playlistItems');
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');
const selectedCount = document.getElementById('selectedCount');
const downloadPlaylistBtn = document.getElementById('downloadPlaylistBtn');

const formatSelect = document.getElementById('formatSelect');
const qualitySelect = document.getElementById('qualitySelect');
const startDownloadBtn = document.getElementById('startDownloadBtn');

const progressSection = document.getElementById('progressSection');
const progressStatus = document.getElementById('progressStatus');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');

const downloadReady = document.getElementById('downloadReady');
const downloadLink = document.getElementById('downloadLink');
const downloadAnotherBtn = document.getElementById('downloadAnotherBtn');

const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// State
let currentJobId = null;
let pollInterval = null;
let currentMetadata = null;
let playlistData = [];

// ========================================
// Theme Management
// ========================================

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

themeToggle.addEventListener('click', toggleTheme);

// ========================================
// History Management
// ========================================

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    if (history.length > 0) {
        historySection.classList.remove('hidden');
        renderHistory(history);
    } else {
        historySection.classList.add('hidden');
    }
}

function addToHistory(metadata, downloadUrl, format) {
    const history = JSON.parse(localStorage.getItem('downloadHistory') || '[]');

    const newItem = {
        id: Date.now(),
        title: metadata.title || 'Unknown Video',
        thumbnail: metadata.thumbnail,
        uploader: metadata.uploader,
        downloadUrl: downloadUrl,
        format: format,
        date: new Date().toLocaleDateString()
    };

    // Add to beginning, limit to 10 items
    history.unshift(newItem);
    if (history.length > 10) history.pop();

    localStorage.setItem('downloadHistory', JSON.stringify(history));
    loadHistory();
}

function renderHistory(history) {
    historyList.innerHTML = '';

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <img src="${item.thumbnail || ''}" class="history-thumb" alt="Thumbnail" onerror="this.style.display='none'">
            <div class="history-info">
                <div class="history-title" title="${item.title}">${item.title}</div>
                <div class="history-meta">${item.format.toUpperCase()} • ${item.uploader || 'Unknown'} • ${item.date}</div>
            </div>
            <div class="history-actions">
                <a href="${item.downloadUrl}" download class="btn-icon-only" title="Download Again">
                    <i class="fas fa-download"></i>
                </a>
            </div>
        `;
        historyList.appendChild(div);
    });
}

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear download history?')) {
        localStorage.removeItem('downloadHistory');
        loadHistory();
    }
});

// ========================================
// URL Validation & Preview
// ========================================

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('active');
    setTimeout(() => {
        errorMessage.classList.remove('active');
        setTimeout(() => errorMessage.classList.add('hidden'), 300);
    }, 5000);
}

function hideError() {
    errorMessage.classList.remove('active');
    errorMessage.classList.add('hidden');
}

async function validateAndFetchVideo() {
    const url = videoUrlInput.value.trim();

    if (!url) {
        showError('Please enter a video URL');
        return;
    }

    if (!isValidUrl(url)) {
        showError('Please enter a valid URL (must start with http:// or https://)');
        return;
    }

    hideError();
    validateBtn.disabled = true;
    validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // Reset UI
    videoPreview.classList.add('hidden');
    playlistSection.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If not JSON, it's likely a server error page (HTML) or empty
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error(`Server returned unexpected response: ${response.status} ${response.statusText}`);
        }

        if (!response.ok) throw new Error(data.error || 'Failed to validate URL');

        if (data.valid) {
            currentMetadata = data.metadata;

            if (currentMetadata.type === 'playlist') {
                displayPlaylist(currentMetadata);
            } else {
                displayVideoPreview(currentMetadata);
            }
        } else {
            throw new Error('Invalid or unsupported video URL');
        }
    } catch (error) {
        showError(error.message || 'Invalid or unsupported link. Please try again.');
        console.error('Validation error:', error);
    } finally {
        validateBtn.disabled = false;
        validateBtn.innerHTML = '<i class="fas fa-search"></i>';
    }
}

function displayVideoPreview(metadata) {
    if (metadata.thumbnail) {
        thumbnailImg.src = metadata.thumbnail;
        thumbnailImg.style.display = 'block';
    } else {
        thumbnailImg.style.display = 'none';
    }

    videoTitle.textContent = metadata.title || 'Unknown Title';
    videoDuration.textContent = metadata.duration ? formatDuration(metadata.duration) : '';

    const metaParts = [];
    if (metadata.uploader) metaParts.push(metadata.uploader);
    if (metadata.view_count) metaParts.push(`${formatNumber(metadata.view_count)} views`);
    videoMeta.textContent = metaParts.join(' • ');

    videoPreview.classList.remove('hidden');
    videoPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========================================
// Playlist Management
// ========================================

function displayPlaylist(metadata) {
    playlistTitle.textContent = metadata.title || 'Playlist';
    playlistData = metadata.videos || [];

    playlistItems.innerHTML = '';
    playlistData.forEach((video, index) => {
        const div = document.createElement('div');
        div.className = 'playlist-item selected';
        div.dataset.index = index;
        div.innerHTML = `
            <div class="playlist-checkbox"><i class="fas fa-check"></i></div>
            <div class="playlist-info">
                <div class="playlist-video-title">${video.title}</div>
                <div class="playlist-video-meta">${formatDuration(video.duration)} • ${video.uploader || 'Unknown'}</div>
            </div>
        `;
        div.addEventListener('click', () => togglePlaylistItem(div));
        playlistItems.appendChild(div);
    });

    updateSelectedCount();
    playlistSection.classList.remove('hidden');
    playlistSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function togglePlaylistItem(element) {
    element.classList.toggle('selected');
    const checkbox = element.querySelector('.playlist-checkbox i');
    if (element.classList.contains('selected')) {
        checkbox.className = 'fas fa-check';
    } else {
        checkbox.className = '';
    }
    updateSelectedCount();
}

function updateSelectedCount() {
    const count = document.querySelectorAll('.playlist-item.selected').length;
    selectedCount.textContent = `${count} videos selected`;
    downloadPlaylistBtn.disabled = count === 0;
}

selectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.classList.add('selected');
        item.querySelector('.playlist-checkbox i').className = 'fas fa-check';
    });
    updateSelectedCount();
});

deselectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.classList.remove('selected');
        item.querySelector('.playlist-checkbox i').className = '';
    });
    updateSelectedCount();
});

downloadPlaylistBtn.addEventListener('click', async () => {
    const selectedIndices = Array.from(document.querySelectorAll('.playlist-item.selected'))
        .map(item => parseInt(item.dataset.index));

    if (selectedIndices.length === 0) return;

    // For now, just pick the first one to demonstrate or loop
    // Implementing full batch download queue is complex for this demo
    // So we will just download the first selected one and alert the user
    // Or better, trigger sequential downloads

    alert(`Starting download for ${selectedIndices.length} videos. Please allow multiple downloads if prompted.`);

    for (const index of selectedIndices) {
        const video = playlistData[index];
        await startDownloadForPlaylist(video);
        // Small delay to prevent rate limiting
        await new Promise(r => setTimeout(r, 1000));
    }
});

async function startDownloadForPlaylist(video) {
    // Reuse startDownload logic but with specific video URL
    const url = video.url;
    const format = formatSelect.value || 'mp4';
    const quality = qualitySelect.value || '720';

    try {
        const response = await fetch(`${API_URL}/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, format, quality }),
        });
        const data = await response.json();
        if (response.ok) {
            // We can't easily track progress for multiple files in this simple UI
            // So we'll just notify when done or let the browser handle it
            // Ideally we'd have a queue UI
            console.log(`Started download for ${video.title}: ${data.jobId}`);

            // For single video flow, we switch to progress view. 
            // For playlist, we might want to stay on playlist view.
            // Let's just show a toast or simple status update
        }
    } catch (e) {
        console.error(e);
    }
}


function formatDuration(seconds) {
    if (!seconds) return '';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ========================================
// Download Process
// ========================================

async function startDownload() {
    const url = videoUrlInput.value.trim();
    const format = formatSelect.value;
    const quality = qualitySelect.value;

    hideError();
    startDownloadBtn.disabled = true;
    startDownloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';

    try {
        const response = await fetch(`${API_URL}/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, format, quality }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to start download');

        currentJobId = data.jobId;

        videoPreview.classList.add('hidden');
        progressSection.classList.remove('hidden');
        progressSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        startProgressPolling();

    } catch (error) {
        showError(error.message || 'Failed to start download. Please try again.');
        startDownloadBtn.disabled = false;
        startDownloadBtn.innerHTML = '<i class="fas fa-download"></i> Start Download';
    }
}

function startProgressPolling() {
    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(async () => {
        if (!currentJobId) return;

        try {
            const response = await fetch(`${API_URL}/status/${currentJobId}`);
            const data = await response.json();

            if (data.status === 'processing') {
                const percent = Math.round(data.progress || 0);
                progressPercent.textContent = `${percent}%`;
                progressFill.style.width = `${percent}%`;
                progressStatus.textContent = 'Downloading & Converting...';
            } else if (data.status === 'completed') {
                clearInterval(pollInterval);
                finishDownload(data.downloadUrl);
            } else if (data.status === 'error') {
                clearInterval(pollInterval);
                showError('Download failed: ' + (data.error || 'Unknown error'));
                resetUI();
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 1000);
}

function stopProgressPolling() {
    if (pollInterval) clearInterval(pollInterval);
}

function finishDownload(url) {
    progressSection.classList.add('hidden');
    downloadReady.classList.remove('hidden');
    downloadLink.href = url;

    // Add to history
    if (currentMetadata) {
        addToHistory(currentMetadata, url, formatSelect.value);
    }
}

function resetUI() {
    videoUrlInput.value = '';
    videoPreview.classList.add('hidden');
    progressSection.classList.add('hidden');
    downloadReady.classList.add('hidden');
    playlistSection.classList.add('hidden');

    startDownloadBtn.disabled = false;
    startDownloadBtn.innerHTML = '<i class="fas fa-download"></i> Start Download';

    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    progressStatus.textContent = 'Starting download...';
}

// ========================================
// Event Listeners
// ========================================

validateBtn.addEventListener('click', validateAndFetchVideo);

videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') validateAndFetchVideo();
});

startDownloadBtn.addEventListener('click', startDownload);

downloadAnotherBtn.addEventListener('click', resetUI);

// ========================================
// Particle Animation
// ========================================

function initParticles() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
            this.color = Math.random() > 0.5 ? 'rgba(0, 242, 255, ' : 'rgba(255, 0, 85, ';
            this.alpha = Math.random() * 0.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }
    }

    function init() {
        resize();
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    init();
    animate();
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadHistory();
    initParticles();
});

window.addEventListener('beforeunload', () => {
    stopProgressPolling();
});
