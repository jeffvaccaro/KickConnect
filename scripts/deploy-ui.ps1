<#
deploy-ui.ps1

Builds the Angular app and deploys the production `dist/` contents to an S3 bucket, then optionally invalidates a CloudFront distribution.

Defaults in this script are set from your workspace:
- Bucket: kickconnect-angular
- CloudFront DistributionId: E3OR1QVCCECPVP

Usage (from repo root):
  pwsh -File .\scripts\deploy-ui.ps1
  # or with args
  pwsh -File .\scripts\deploy-ui.ps1 -Bucket my-bucket -DistributionId ABCDEF12345 -Profile default -Region us-east-1 -Invalidate

Notes:
- Requires AWS CLI v2 configured with an appropriate profile that can S3:PutObject, S3:DeleteObject, and cloudfront:CreateInvalidation if you use -Invalidate.
- The script will run `npm run build:prod` inside `KC_UI` by default.
- The script attempts to locate the generated `dist/<app>` folder automatically.
#>

param(
    [string]$Bucket = "kickconnect-angular",
    [string]$DistributionId = "E3OR1QVCCECPVP",
    [string]$Profile = "kickconnect-deployer",
    [string]$Region = "us-west-2",
    [switch]$Invalidate,
    [switch]$SkipBuild
)

Set-StrictMode -Version Latest

try {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $repoRoot = (Resolve-Path (Join-Path $scriptDir ".." )).Path
    $kcUiPath = Join-Path $repoRoot 'KC_UI'
} catch {
    Write-Error "Failed to resolve repository paths: $_"
    exit 1
}

Write-Output "Repository root: $repoRoot"
Write-Output "KC_UI path: $kcUiPath"

# dist folder path (used by build-checking logic)
$distRoot = Join-Path $kcUiPath 'dist'

if (-not $SkipBuild) {
    # If a dist subfolder already exists, assume a prior build completed and skip rebuilding to save time.
    if (Test-Path $distRoot) {
        $existingCount = (Get-ChildItem -Path $distRoot -Directory -ErrorAction SilentlyContinue | Measure-Object).Count
        if ($existingCount -gt 0) {
            Write-Output "Found existing dist folder with $existingCount project(s); skipping build. Use -SkipBuild to force skip or remove dist/ to rebuild."
        } else {
            Write-Output "Running production build in KC_UI..."
            Push-Location $kcUiPath
            $buildCmd = 'npm run build:prod'
            Write-Output "$buildCmd"
            $buildResult = & npm run build:prod 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Build failed. Output:`n$buildResult"
                Pop-Location
                exit 2
            }
            Pop-Location
        }
    } else {
        Write-Output "Running production build in KC_UI..."
        Push-Location $kcUiPath
        $buildCmd = 'npm run build:prod'
        Write-Output "$buildCmd"
        $buildResult = & npm run build:prod 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Build failed. Output:`n$buildResult"
            Pop-Location
            exit 2
        }
        Pop-Location
    }
} else {
    Write-Output "Skipping build (--SkipBuild supplied)."
}

# (dist path is defined earlier in the script)
if (-not (Test-Path $distRoot)) {
    Write-Error "dist folder not found after build: $distRoot"
    exit 3
}

# Find first directory under dist (Angular typically creates dist/<projectName>)
$subdirs = @(Get-ChildItem -Path $distRoot -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name -ErrorAction SilentlyContinue)
if (-not $subdirs -or $subdirs.Count -eq 0) {
    Write-Error "No subfolder found under $distRoot. Expected dist/<project> structure."
    exit 4
}

$first = $subdirs[0]
$appDist = Join-Path $distRoot $first
# If the Angular build produced a nested 'browser' folder (dist/<project>/browser), use that as the upload root
$nestedBrowser = Join-Path $appDist 'browser'
if (Test-Path $nestedBrowser) {
    $uploadPath = $nestedBrowser
    Write-Output "Found nested 'browser/' folder; deploying contents of: $uploadPath -> s3://$Bucket/"
} else {
    $uploadPath = $appDist
    Write-Output "Deploying contents of: $appDist -> s3://$Bucket/"
}
# We want to ensure we sync the actual build *contents* into the S3 prefix that CloudFront expects.
# CloudFront is configured with an OriginPath '/browser', so we will upload contents into the 'browser/' prefix.
$originPrefix = 'browser'

# If the upload path contains an inner '$originPrefix' folder (for example the user passed a parent folder),
# use that inner folder as the source to avoid creating a nested 'browser/browser' structure in S3.
$maybeNested = Join-Path $uploadPath $originPrefix
if (Test-Path $maybeNested) {
    $sourceToSync = $maybeNested
    Write-Output "Detected inner '$originPrefix' folder; syncing contents of: $sourceToSync -> s3://$Bucket/$originPrefix/"
} else {
    $sourceToSync = $uploadPath
    Write-Output "Syncing contents of: $sourceToSync -> s3://$Bucket/$originPrefix/"
}

# Run aws s3 sync (ensure we sync contents by adding a trailing slash to the source path)
$srcForAws = "$sourceToSync\"
$awsArgs = @('s3','sync', $srcForAws, "s3://$Bucket/$originPrefix/", '--delete', '--profile', $Profile, '--region', $Region)
Write-Output "aws $($awsArgs -join ' ')"

# Validate AWS profile exists before calling sync (gives a clearer error)
$profileCheck = & aws configure get aws_access_key_id --profile $Profile 2>&1
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($profileCheck)) {
    Write-Error "The config profile ($Profile) could not be found. Run 'aws configure --profile $Profile' or pass -Profile with a valid profile."
    exit 8
}

$syncOut = & aws @awsArgs 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "aws s3 sync failed. Output:`n$syncOut"
    exit 5
}
Write-Output "Sync succeeded. Output:`n$syncOut"

if ($Invalidate) {
    if ([string]::IsNullOrWhiteSpace($DistributionId)) {
        Write-Error "Invalidation requested but DistributionId not supplied."
        exit 6
    }

    Write-Output "Creating CloudFront invalidation for distribution: $DistributionId"
    $invArgs = @('cloudfront','create-invalidation','--distribution-id',$DistributionId,"--paths","/*","--profile",$Profile)
    Write-Output "aws $($invArgs -join ' ')"
    $invOut = & aws @invArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "CloudFront invalidation failed. Output:`n$invOut"
        exit 7
    }
    Write-Output "Invalidation created. Output:`n$invOut"
} else {
    Write-Output "No CloudFront invalidation requested. Pass -Invalidate to create one."
}

Write-Output "UI deploy finished successfully."
exit 0
