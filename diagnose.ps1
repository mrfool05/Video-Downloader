# Diagnostic Script for Bippi Downloader Issues
# Run this to diagnose why adult sites aren't working

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Bippi Downloader - Network Diagnostic" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if yt-dlp exists
Write-Host "[Test 1] Checking yt-dlp installation..." -ForegroundColor Yellow
$ytdlpPath = "C:\Program Files\yt-dlp\yt-dlp.exe"
if (Test-Path $ytdlpPath) {
    Write-Host "  ✓ yt-dlp found at: $ytdlpPath" -ForegroundColor Green
    $version = & $ytdlpPath --version
    Write-Host "  ✓ Version: $version" -ForegroundColor Green
} else {
    Write-Host "  ✗ yt-dlp NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# Test 2: Check Windows Firewall status
Write-Host "[Test 2] Checking Windows Firewall..." -ForegroundColor Yellow
$firewallProfiles = Get-NetFirewallProfile
foreach ($profile in $firewallProfiles) {
    Write-Host "  $($profile.Name): $($profile.Enabled)" -ForegroundColor Cyan
}
Write-Host ""

# Test 3: Check if yt-dlp is allowed through firewall
Write-Host "[Test 3] Checking if yt-dlp is blocked by firewall..." -ForegroundColor Yellow
$firewallRules = Get-NetFirewallApplicationFilter -Program $ytdlpPath -ErrorAction SilentlyContinue
if ($firewallRules) {
    Write-Host "  ✓ Firewall rules found for yt-dlp" -ForegroundColor Green
} else {
    Write-Host "  ⚠ No specific firewall rules for yt-dlp (may use default)" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Check DNS settings
Write-Host "[Test 4] Checking DNS settings..." -ForegroundColor Yellow
$dns = Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object {$_.ServerAddresses}
foreach ($adapter in $dns) {
    if ($adapter.ServerAddresses) {
        Write-Host "  $($adapter.InterfaceAlias): $($adapter.ServerAddresses -join ', ')" -ForegroundColor Cyan
    }
}
Write-Host ""

# Test 5: Test YouTube with yt-dlp (should work)
Write-Host "[Test 5] Testing YouTube download (should work)..." -ForegroundColor Yellow
Write-Host "  Testing with short video..." -ForegroundColor Gray
$testYoutube = & $ytdlpPath --dump-json --no-playlist "https://www.youtube.com/watch?v=jNQXAC9IVRw" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ YouTube works!" -ForegroundColor Green
} else {
    Write-Host "  ✗ YouTube failed - serious issue!" -ForegroundColor Red
    Write-Host "  Error: $testYoutube" -ForegroundColor Red
}
Write-Host ""

# Test 6: Test XVideos (will likely fail)
Write-Host "[Test 6] Testing XVideos download (diagnostic)..." -ForegroundColor Yellow
Write-Host "  This will likely fail - checking error type..." -ForegroundColor Gray
$testXvideos = & $ytdlpPath --dump-json --no-playlist --user-agent "Mozilla/5.0" "https://www.xvideos.com/video70831990/test" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ XVideos works!" -ForegroundColor Green
} else {
    Write-Host "  ✗ XVideos failed (expected)" -ForegroundColor Yellow
    $errorMsg = $testXvideos | Select-String "ERROR"
    Write-Host "  Error: $errorMsg" -ForegroundColor Red
}
Write-Host ""

# Test 7: Check for antivirus
Write-Host "[Test 7] Checking for antivirus software..." -ForegroundColor Yellow
$av = Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct -ErrorAction SilentlyContinue
if ($av) {
    foreach ($product in $av) {
        Write-Host "  Found: $($product.displayName)" -ForegroundColor Cyan
    }
} else {
    Write-Host "  None detected (or Windows Defender only)" -ForegroundColor Gray
}
Write-Host ""

# Test 8: Check proxy settings
Write-Host "[Test 8] Checking proxy settings..." -ForegroundColor Yellow
$proxy = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" | Select-Object ProxyEnable, ProxyServer
if ($proxy.ProxyEnable -eq 1) {
    Write-Host "  ⚠ Proxy enabled: $($proxy.ProxyServer)" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ No proxy configured" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSIS COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. If YouTube failed: yt-dlp installation issue" -ForegroundColor White
Write-Host "2. If antivirus found: Try disabling web protection temporarily" -ForegroundColor White
Write-Host "3. If proxy enabled: Disable it" -ForegroundColor White
Write-Host "4. Try running PowerShell as Administrator and re-run this script" -ForegroundColor White
Write-Host "5. If all else fails: Install ProtonVPN (free)" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
