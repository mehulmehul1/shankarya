# Vercel Deploy Script (Windows PowerShell - Fast)
# Deploys project to Vercel without requiring GitHub push
# Usage: .\deploy-vercel.ps1

$ErrorActionPreference = "Stop"

# Configuration
$DEPLOY_ENDPOINT = "https://claude-skills-deploy.vercel.com/api/deploy"
$PROJECT_PATH = "C:\Users\mehul\OneDrive\Desktop\Studio\PROJECTS\shankarya"
$FRAMEWORK = "nextjs"

Write-Host "Preparing deployment..." -ForegroundColor Cyan

try {
    # Create temp directory
    $TEMP_DIR = Join-Path $env:TEMP "vercel-deploy-$(Get-Date -Format 'yyyyMMddHHmmss')"
    New-Item -ItemType Directory -Path $TEMP_DIR -Force | Out-Null
    
    Write-Host "Creating deployment package..." -ForegroundColor Cyan
    
    # Create zip using 7zip (much faster) or fallback to PowerShell
    $TARBALL = Join-Path $TEMP_DIR "project.zip"
    
    # Check for 7zip
    $7zipPath = "$env:ProgramFiles\7-Zip\7z.exe"
    if (-not (Test-Path $7zipPath)) {
        $7zipPath = "$env:ProgramFiles(x86)\7-Zip\7z.exe"
    }
    
    if (Test-Path $7zipPath) {
        Write-Host "Using 7zip for faster compression..." -ForegroundColor Green
        # Use 7zip to create archive, excluding specified folders
        $excludeArgs = @("-x!node_modules\*", "-x!.git\*", "-x!.next\*", "-x!dist\*", "-x!build\*")
        & $7zipPath a -tzip $TARBALL "$PROJECT_PATH\*" @excludeArgs 2>&1 | Out-Null
    } else {
        Write-Host "Using PowerShell Compress-Archive..." -ForegroundColor Yellow
        # Fallback to PowerShell (slower)
        $files = Get-ChildItem -Path $PROJECT_PATH -Recurse -File | Where-Object {
            $_.FullName -notmatch "\\node_modules\\" -and
            $_.FullName -notmatch "\.git\\" -and
            $_.FullName -notmatch "\.next\\" -and
            $_.FullName -notmatch "\\dist\\" -and
            $_.FullName -notmatch "\\build\\"
        }
        Compress-Archive -Path $files.FullName -DestinationPath $TARBALL -Force -CompressionLevel Optimal
    }
    
    # Check if zip was created
    if (-not (Test-Path $TARBALL)) {
        Write-Host "Error: Failed to create zip file" -ForegroundColor Red
        exit 1
    }
    
    $zipSize = [math]::round((Get-Item $TARBALL).Length / 1MB, 2)
    Write-Host "Zip size: $zipSize MB" -ForegroundColor Cyan
    
    Write-Host "Deploying..." -ForegroundColor Cyan
    
    # Upload using Vercel CLI (faster than curl for this use case)
    Set-Location $PROJECT_PATH
    $output = & vercel deploy --prod --yes --token=$env:VERCEL_TOKEN 2>&1
    
    # Check for preview URL in output
    if ($output -match "https://.*\.vercel\.app") {
        $url = $matches[0]
        Write-Host ""
        Write-Host "Deployment successful!" -ForegroundColor Green
        Write-Host "Preview URL: $url" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "View your site at the URL above." -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "Deployment output:" -ForegroundColor DarkGray
        Write-Host $output
        Write-Host ""
        Write-Host "Could not find deployment URL in output." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    exit 1
} finally {
    # Cleanup temp directory
    if (Test-Path $TEMP_DIR) {
        Remove-Item $TEMP_DIR -Recurse -Force
    }
}
