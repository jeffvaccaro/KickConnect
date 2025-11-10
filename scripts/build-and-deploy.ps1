<#
build-and-deploy.ps1

Builds the Angular UI, uploads it to S3, optionally invalidates CloudFront, then packages the Express API folder into a 7-Zip archive suitable for Elastic Beanstalk.

Usage (from repo root):
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-and-deploy.ps1

Parameters:
  -AwsProfile (string)   AWS CLI profile to use (default: kickconnect-deployer)
  -Region (string)    AWS region for S3 (default: us-west-2)
  -Bucket (string)    S3 bucket to upload UI to (default: kickconnect-angular)
  -DistributionId     CloudFront distribution id to invalidate (default: E3OR1QVCCECPVP)
  -Invalidate         Switch to request CloudFront invalidation after upload
  -ApiPath (string)   Path to API folder relative to repo root (default: KC_API\api)
  -UiPath (string)    Path to UI folder relative to repo root (default: KC_UI)
  -SevenZipPath       Full path to 7z.exe (default: 'C:\Program Files\7-Zip\7z.exe')
  -SkipUiBuild        Skip building Angular and only upload existing dist
  -SkipApiPackage     Skip packaging the API (useful for only deploying UI)
#>

param(
    [string]$AwsProfile = "kickconnect-deployer",
    [string]$Region = "us-west-2",
    [string]$Bucket = "kickconnect-angular",
    [string]$DistributionId = "E3OR1QVCCECPVP",
    [switch]$Invalidate,
    [string]$ApiPath = "KC_API\api",
    [string]$UiPath = "KC_UI",
    [string]$SevenZipPath = "C:\Program Files\7-Zip\7z.exe",
    [switch]$SkipUiBuild,
    [switch]$SkipApiPackage
)

Set-StrictMode -Version Latest

try {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $repoRoot = (Resolve-Path (Join-Path $scriptDir ".." )).Path
    $kcUiPath = Join-Path $repoRoot $UiPath
    $apiPath = Join-Path $repoRoot $ApiPath
} catch {
    Write-Error "Failed to resolve repository paths: $_"
    exit 1
}

Write-Output "Repository root: $repoRoot"
Write-Output "UI path: $kcUiPath"
Write-Output "API path: $apiPath"

# 1) Build UI (unless skipped)
if (-not $SkipUiBuild) {
    if (-not (Test-Path $kcUiPath)) {
        Write-Error "UI path not found: $kcUiPath"
        exit 2
    }

    Push-Location $kcUiPath
    Write-Output "Running UI production build (npm run build:prod)..."
    $buildResult = & npm run build:prod 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "UI build failed. Output:`n$buildResult"
        Pop-Location
        exit 3
    }
    Pop-Location
} else {
    Write-Output "Skipping UI build (--SkipUiBuild supplied)."
}

# locate dist/<project>
$distRoot = Join-Path $kcUiPath 'dist'
if (-not (Test-Path $distRoot)) {
    Write-Error "dist folder not found under UI path: $distRoot"
    exit 4
}

$subdirs = @(Get-ChildItem -Path $distRoot -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name -ErrorAction SilentlyContinue)
if (-not $subdirs -or $subdirs.Count -eq 0) {
    Write-Error "No project folder found under $distRoot"
    exit 5
}

$first = $subdirs[0]
$appDist = Join-Path $distRoot $first
$nestedBrowser = Join-Path $appDist 'browser'
if (Test-Path $nestedBrowser) {
    $uploadPath = $nestedBrowser
    Write-Output "Found nested 'browser/' folder; uploading that to s3://$Bucket/"
} else {
    $uploadPath = $appDist
    Write-Output "Uploading contents of: $uploadPath -> s3://$Bucket/"
}

# Validate AWS profile
$profileCheck = & aws configure get aws_access_key_id --profile $AwsProfile 2>&1
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($profileCheck)) {
    Write-Error "The config profile ($AwsProfile) could not be found. Run 'aws configure --profile $AwsProfile' or pass -AwsProfile with a valid profile."
    exit 6
}

# Upload to S3
 $awsArgs = @('s3','sync', "$uploadPath", "s3://$Bucket/", '--delete', '--profile', $AwsProfile, '--region', $Region)
Write-Output "aws $($awsArgs -join ' ')"
$syncOut = & aws @awsArgs 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "aws s3 sync failed. Output:`n$syncOut"
    exit 7
}
Write-Output "S3 sync succeeded. Output:`n$syncOut"

if ($Invalidate) {
    if ([string]::IsNullOrWhiteSpace($DistributionId)) {
        Write-Error "Invalidation requested but DistributionId not supplied."
        exit 8
    }
    Write-Output "Creating CloudFront invalidation for distribution: $DistributionId"
    $invArgs = @('cloudfront','create-invalidation','--distribution-id',$DistributionId,"--paths","/*","--profile",$AwsProfile)
    Write-Output "aws $($invArgs -join ' ')"
    $invOut = & aws @invArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "CloudFront invalidation failed. Output:`n$invOut"
        exit 9
    }
    Write-Output "Invalidation created. Output:`n$invOut"
} else {
    Write-Output "No CloudFront invalidation requested. Pass -Invalidate to create one."
}

if ($SkipApiPackage) {
    Write-Output "Skipping API packaging (--SkipApiPackage supplied)."
    exit 0
}

# 2) Package API with 7-Zip
if (-not (Test-Path $apiPath)) {
    Write-Error "API path not found: $apiPath"
    exit 10
}

Push-Location $apiPath

Write-Output "Installing production dependencies (npm ci)..."
& npm ci 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm ci failed in $apiPath"
    Pop-Location
    exit 11
}

# timestamped filename
$ts = Get-Date -Format yyyyMMdd-HHmmss
$deployDir = Join-Path $repoRoot 'Deploy'
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
$zipName = Join-Path $deployDir "KC-EB-Deploy-FULL-$ts.zip"

if (-not (Test-Path $SevenZipPath)) {
    Write-Error "7-Zip executable not found at: $SevenZipPath. Please install 7-Zip or pass -SevenZipPath where 7z.exe is located."
    Pop-Location
    exit 12
}

Write-Output "Creating 7-Zip archive: $zipName (this may take a moment)"
& "$SevenZipPath" a "$zipName" * -xr!"node_modules\*" -r | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "7-Zip failed to create archive."
    Pop-Location
    exit 13
}

Pop-Location

Write-Output "API packaged successfully: $zipName"
Write-Output "All steps completed successfully."
exit 0
