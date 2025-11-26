# Bippi Downloader - Adult Site Compatibility Guide

## ✅ Fully Supported Sites

These sites work reliably with Bippi Downloader:

- **YouTube** - Excellent support
- **Vimeo** - Good support
- **Twitter/X** - Good support
- **Dailymotion** - Good support
- **TikTok** - Good support (non-login required videos)

## ⚠️ Partially Supported Adult Sites

### Sites with Mixed Results:
- **XVideos** - Usually works
- **XNXX** - Usually works  
- **Spankbang** - Sometimes works
- **XHamster** - Sometimes works
- **RedTube** - Sometimes works

### Try these alternatives if main sites don't work:
- Use different video URLs from the same site
- Try videos with more views (tend to have better accessibility)
- Avoid age-restricted or premium content

## ❌ Sites with Strong Anti-Bot Protection

These sites actively block yt-dlp and similar tools:

- **Pornhub** - Very aggressive anti-bot (blocks yt-dlp)
- **Eporner** - Active connection blocking
- **OnlyFans** - Requires login, paywall
- **Brazzers** - Requires subscription

### Why Pornhub/Eporner Don't Work:

**Technical Reason**:
```
ERROR: Unable to download webpage: 
Connection aborted. ConnectionResetError
(10054, 'An existing connection was forcibly closed by the remote host')
```

**What This Means**:
- The site detects automated tools (like yt-dlp)
- Actively closes the connection before data is sent
- Even with browser headers, they fingerprint the tool

### Workarounds (Advanced Users):

1. **Update yt-dlp** to latest version:
   ```powershell
   yt-dlp -U
   ```

2. **Try xvideos/xnxx** instead (similar content, better support)

3. **Use browser extensions** (outside this app):
   - Video DownloadHelper
   - Flash Video Downloader

4. **Screen recording** as last resort

## 🔧 Technical Details

The app uses these flags for adult sites:
- `--user-agent` - Mimics Chrome browser
- `--add-header Accept` - Proper HTTP headers
- `--referer` - Sets referrer header
- `--age-limit 0` - Bypasses age gates
- `--geo-bypass` - Bypasses region locks
- `--retries 10` - Retry on connection issues
- `--sleep-interval` - Avoid rate limiting

## 📊 Success Rates (Approximate)

| Site | Success Rate | Notes |
|------|--------------|-------|
| YouTube | 99% | Excellent |
| XVideos | 75% | Good |
| XNXX | 75% | Good |
| Spankbang | 50% | Variable |
| XHamster | 50% | Variable |
| **Pornhub** | **5%** | Usually blocked |
| **Eporner** | **5%** | Usually blocked |

## 💡 Recommendations

### Best Adult Sites for This App:
1. **XVideos** - Most reliable adult content
2. **XNXX** - Similar to XVideos, good support
3. **Spankbang** - Decent success rate
4. **XHamster** - Works for some videos

### Avoid:
- Pornhub (unless urgent - very low success)
- Sites requiring login/subscription
- DRM-protected content

## 🔄 Future Updates

Potential improvements:
- Browser cookie import (requires manual browser cookie export)
- Proxy support (bypass IP-based blocks)
- yt-dlp automatic updates
- Alternative extractors

## ⚠️ Important Notes

1. **This is a limitation of yt-dlp**, not Bippi Downloader specifically
2. Adult sites change their anti-bot protection frequently
3. What works today may not work tomorrow
4. Always use videos for **personal use only**
5. Respect copyright and terms of service

---

**Bottom Line**: Use **XVideos** or **XNXX** instead of Pornhub for best results with this downloader.
