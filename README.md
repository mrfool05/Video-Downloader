# Bippi Downloader

A modern, secure web-based application for downloading videos from various platforms.

## 🚀 Features

- **Simple Interface**: Clean, intuitive UI for easy video downloading
- **Multiple Quality Options**: Choose from 1080p, 720p, 480p, or audio-only
- **Format Selection**: Download as MP4 or WEBM
- **Real-time Progress**: Track your download with live progress updates
- **Privacy-Focused**: No user registration required, anonymous usage
- **Auto-Cleanup**: Files automatically deleted after 24 hours
- **Secure**: Rate limiting, HTTPS ready, XSS protection

## 📋 Requirements

- Node.js (v16 or higher)
- npm or yarn
- yt-dlp installed globally (for video processing)

## 🛠️ Installation

1. **Clone or download this project**

2. **Install yt-dlp**:
   ```bash
   # Windows (using Chocolatey)
   choco install yt-dlp
   
   # Or download from: https://github.com/yt-dlp/yt-dlp/releases
   # Add to PATH
   ```

3. **Install Node.js dependencies**:
   ```bash
   cd bippi-downloader
   npm install
   ```

## 🚦 Running Locally

```bash
npm start
```

Then open your browser to: `http://localhost:3000`

## 📁 Project Structure

```
bippi-downloader/
├── frontend/          # Client-side files
│   ├── index.html    # Main application page
│   ├── css/          # Stylesheets
│   ├── js/           # Client-side JavaScript
│   └── pages/        # Legal pages (Terms, Privacy, DMCA)
├── backend/          # Server-side files
│   ├── server.js     # Express server
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   ├── middleware/   # Security & rate limiting
│   └── temp/         # Temporary file storage
└── package.json      # Dependencies
```

## 🔒 Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- Helmet.js for security headers
- Input validation and sanitization
- XSS protection
- CORS configuration
- HTTPS ready for production

## 📝 Legal Compliance

- Age verification gate
- Terms of Service
- Privacy Policy (no data collection)
- DMCA/Copyright takedown form

## 🌐 Deployment

For production deployment:

1. Get a domain name
2. Set up SSL certificate (Let's Encrypt recommended)
3. Configure environment variables
4. Deploy to VPS (DigitalOcean, AWS, etc.)
5. Set up reverse proxy (Nginx recommended)

## ⚠️ Legal Disclaimer

This tool is provided for educational and personal use only. Users are responsible for complying with copyright laws and terms of service of video platforms in their jurisdiction. The developers are not responsible for misuse of this software.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is a personal project. Feel free to fork and modify for your own use.

## 📧 Support

For copyright takedown requests, please use the DMCA form on the website.
