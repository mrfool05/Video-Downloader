# TROUBLESHOOTING: Adult Sites Not Working

## Problem
All adult video sites (Pornhub, XVideos, XNXX, Eporner, etc.) are failing with:
```
ERROR: Unable to download webpage
ConnectionResetError: An existing connection was forcibly closed by the remote host
```

## Root Cause
This is **NOT a bug in Bippi Downloader**. Testing shows yt-dlp fails even when run directly from command line, which means:

**Your ISP or network is blocking adult content access.**

## Possible Causes

### 1. ISP Content Filtering (Most Likely)
Many ISPs block adult sites at the DNS or connection level:
- Common in Middle East, Asia, some European countries
- Can be enabled by default or by parental controls
- Blocks both browser AND downloading tools

### 2. Windows Firewall/Antivirus
- Windows Defender may block yt-dlp from accessing adult sites
- Third-party antivirus (Kaspersky, Norton, etc.) may have "Safe Browsing" enabled

### 3. Router Parental Controls
- Your router may have content filtering enabled
- Check router admin panel (usually http://192.168.1.1)

### 4. VPN/Proxy Blocking
- If using VPN, it might have adult content filters
- Company/school networks definitely block this

## Solutions

### Solution 1: Use a VPN (Recommended)
A VPN will bypass ISP-level blocks:

1. **Install a VPN** (Free options: ProtonVPN, Windscribe)
2. **Connect to VPN**
3. **Try Bippi Downloader again**

Popular VPNs:
- ProtonVPN (free tier available)
- NordVPN
- ExpressVPN
- Windscribe

### Solution 2: Change DNS Servers
Your ISP might only block via DNS:

**Change to Google DNS:**
1. Open Windows Settings → Network & Internet
2. Select your network → Properties
3. IP settings → Edit
4. Set DNS to:
   - Preferred: `8.8.8.8`
   - Alternate: `8.8.4.4`
5. Save and restart

**Or use Cloudflare DNS:**
- Preferred: `1.1.1.1`
- Alternate: `1.0.0.1`

### Solution 3: Check Windows Firewall
1. Open Windows Security
2. Go to Firewall & network protection
3. Allow an app through firewall
4. Find **yt-dlp** or **node.exe**
5. Check both Private and Public boxes

### Solution 4: Disable Antivirus Temporarily
If you have antivirus software:
1. Temporarily disable "Web Protection" or "Safe Browsing"
2. Test if downloads work
3. If yes, add yt-dlp.exe to exception list

### Solution 5: Try Different Sites
Some adult sites may work while others don't:
- Try **Spankbang** (sometimes less blocked)
- Try **RedTube** (sometimes less blocked)
- YouTube and other mainstream sites should work fine

## How to Test

### Test 1: Direct yt-dlp Command
```powershell
cd "C:\Program Files\yt-dlp"
.\yt-dlp.exe --dump-json "https://www.xvideos.com/[VIDEO_ID]"
```

If this fails → Network/ISP block
If this works → App configuration issue

### Test 2: Browser Access
1. Open Opera GX or any browser
2. Visit https://www.xvideos.com
3. If site doesn't load → Confirmed ISP block
4. If site loads → DNS-only block (easier to bypass)

## Verification After Fix

Once you've applied a solution (VPN/DNS change):

1. Restart your computer
2. Start Bippi Downloader: `npm start`
3. Try an XVideos or XNXX URL
4. Should now work!

## Current Status

✅ **Bippi Downloader app**: WORKING (YouTube confirmed)
✅ **yt-dlp installation**: UP TO DATE (2025.11.12)
❌ **Adult site access**: BLOCKED BY ISP/NETWORK

## Alternative Solution

If you CANNOT bypass the blocks:

**Use Bippi Downloader for:**
- YouTube videos
- Vimeo videos
- Twitter/X videos
- TikTok videos
- Dailymotion

**Use browser extensions for adult sites:**
- Video DownloadHelper (Firefox/Chrome)
- Flash Video Downloader
- IDM (Internet Download Manager)

These work differently and might bypass your ISP blocks.

## Need Help?

If you've tried all solutions and nothing works, you likely have strict ISP-level blocking that requires:
1. Contacting your ISP to remove filters
2. Using a VPN (only reliable solution)
3. Using a different network (mobile hotspot, etc.)

---

**Note**: The exact same error occurs for Pornhub, XVideos, XNXX, and Eporner, confirming this is a blanket adult content block, not site-specific issues.
