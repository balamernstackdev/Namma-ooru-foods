# ============================================================
#  Namma Ooru Foods - Hostinger Deploy Script
#  Run this from the frontend/ directory:
#    .\deploy-hostinger.ps1
# ============================================================

$ErrorActionPreference = "Stop"

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$DEPLOY_DIR = "$ROOT\hostinger-deploy"
$ZIP_PATH = "$ROOT\hostinger-deploy.zip"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Namma Ooru Foods - Hostinger Deployer  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ---- Step 1: Clean old deploy ----
Write-Host "[1/5] Cleaning previous deploy folder..." -ForegroundColor Yellow
if (Test-Path $DEPLOY_DIR) { Remove-Item -Recurse -Force $DEPLOY_DIR }
if (Test-Path $ZIP_PATH)   { Remove-Item -Force $ZIP_PATH }

# ---- Step 2: Build Next.js ----
Write-Host "[2/5] Building Next.js (output: standalone)..." -ForegroundColor Yellow
Set-Location $ROOT
$env:NEXT_PUBLIC_API_URL = "https://api.nammaorrufoods.com"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build FAILED. Fix errors and try again." -ForegroundColor Red
    exit 1
}
Write-Host "Build completed successfully!" -ForegroundColor Green

# ---- Step 3: Assemble deploy folder ----
Write-Host "[3/5] Assembling Hostinger deploy package..." -ForegroundColor Yellow

# Copy .next/standalone as the base
$STANDALONE = "$ROOT\.next\standalone"
if (-not (Test-Path $STANDALONE)) {
    Write-Host "ERROR: .next\standalone not found. Make sure next.config.ts has output: 'standalone'" -ForegroundColor Red
    exit 1
}
New-Item -ItemType Directory -Force $DEPLOY_DIR | Out-Null
Copy-Item -Recurse -Force "$STANDALONE\*" "$DEPLOY_DIR\"

# Copy .next/static into deploy/.next/static (required for CSS/JS assets)
Write-Host "  → Copying static assets..." -ForegroundColor Gray
$STATIC_SRC = "$ROOT\.next\static"
$STATIC_DST = "$DEPLOY_DIR\.next\static"
if (Test-Path $STATIC_SRC) {
    if (-not (Test-Path $STATIC_DST)) { New-Item -ItemType Directory -Force $STATIC_DST | Out-Null }
    Copy-Item -Recurse -Force "$STATIC_SRC\*" "$STATIC_DST\"
}

# Copy public/ into deploy/public (images, icons, etc.)
Write-Host "  → Copying public folder..." -ForegroundColor Gray
$PUBLIC_SRC = "$ROOT\public"
$PUBLIC_DST = "$DEPLOY_DIR\public"
if (Test-Path $PUBLIC_SRC) {
    if (-not (Test-Path $PUBLIC_DST)) { New-Item -ItemType Directory -Force $PUBLIC_DST | Out-Null }
    Copy-Item -Recurse -Force "$PUBLIC_SRC\*" "$PUBLIC_DST\"
}

Write-Host "Deploy folder assembled at: $DEPLOY_DIR" -ForegroundColor Green

# ---- Step 4: Create .env for production ----
Write-Host "[4/5] Creating production .env file..." -ForegroundColor Yellow
$ENV_CONTENT = @"
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.nammaorrufoods.com
"@
Set-Content -Path "$DEPLOY_DIR\.env" -Value $ENV_CONTENT
Write-Host "  → .env created (PORT is managed dynamically by Hostinger)" -ForegroundColor Gray

# ---- Step 5: Zip it ----
Write-Host "[5/5] Creating hostinger-deploy.zip..." -ForegroundColor Yellow
Compress-Archive -Path "$DEPLOY_DIR\*" -DestinationPath $ZIP_PATH -Force
Write-Host "ZIP created at: $ZIP_PATH" -ForegroundColor Green

# ---- Done ----
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  DONE! Ready to upload to Hostinger.    " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Upload Instructions:" -ForegroundColor White
Write-Host "  1. Go to Hostinger hPanel -> File Manager" -ForegroundColor Gray
Write-Host "  2. Upload hostinger-deploy.zip to public_html/" -ForegroundColor Gray
Write-Host "  3. Extract the zip there" -ForegroundColor Gray
Write-Host "  4. Go to Advanced -> Node.js -> Create App:" -ForegroundColor Gray
Write-Host "       App Root:     /public_html" -ForegroundColor Gray
Write-Host "       Startup File: server.js" -ForegroundColor Gray
Write-Host "       Node Version: 18.x or 20.x" -ForegroundColor Gray
Write-Host "  5. Click Start and visit your site!" -ForegroundColor Gray
Write-Host ""
Write-Host "ZIP File Location:" -ForegroundColor White
Write-Host "  $ZIP_PATH" -ForegroundColor Cyan
Write-Host ""
