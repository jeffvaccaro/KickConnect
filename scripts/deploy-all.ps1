<#
deploy-all.ps1

Runs a production UI deploy (build + upload to S3 + CloudFront invalidation)
and then packages the API into a 7-Zip archive placed into the repository Deploy/ folder.

This script intentionally does NOT call `eb deploy` (avoids permission issues). It leaves the
created API zip ready for manual upload via the EB Console or via the AWS CLI if you prefer.

Usage (from repo root):
    pwsh -File .\scripts\deploy-all.ps1
    # options:
    pwsh -File .\scripts\deploy-all.ps1 -AwsProfile my-aws-profile -SkipUI -SkipAPI
#>

param(
    [string]$AwsProfile = "kickconnect-deployer",
    [switch]$SkipUI,
    [switch]$SkipAPI,
    [switch]$DryRun
)

Set-StrictMode -Version Latest

try {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $repoRoot = (Resolve-Path (Join-Path $scriptDir ".." )).Path
    Write-Output "Repository root: $repoRoot"
} catch {
    Write-Error "Failed to resolve repository root: $_"
    exit 1
}

# Helper that runs a command in a working directory and throws on non-zero exit
function Invoke-Checked([string]$cmd, [string]$workdir) {
    Write-Output "`n==> RUN: $cmd (cwd: $workdir)"
    if ($DryRun) {
        Write-Output "DRYRUN: would run in $workdir => $cmd"
        return
    }
    Push-Location $workdir
    # Use cmd as a PowerShell -Command string to preserve environment
    $output = & powershell -NoProfile -ExecutionPolicy Bypass -Command $cmd 2>&1
    $exit = $LASTEXITCODE
    Write-Output $output
    Pop-Location
    if ($exit -ne 0) {
        Write-Error ("Command failed with exit code {0} -- {1}" -f $exit, $cmd)
        throw "Step failed"
    }
}

try {
    # UI deploy
    if (-not $SkipUI) {
        Write-Output "\n=== UI: build & deploy (S3 upload + CloudFront invalidation) ==="
        $kcUiPath = Join-Path $repoRoot 'KC_UI'
    Invoke-Checked 'npm run deploy:prod' $kcUiPath
        Write-Output "UI deploy finished."
    } else { Write-Output "Skipping UI deploy (SkipUI)." }

    # API package
    if (-not $SkipAPI) {
        Write-Output "\n=== API: npm ci and package (7-Zip) ==="
        $apiPath = Join-Path $repoRoot 'KC_API\api'

        Write-Output "Installing API dependencies (npm ci)..."
    Invoke-Checked 'npm ci' $apiPath

        Write-Output "Creating API EB package (npm run package:eb)..."
    Invoke-Checked 'npm run package:eb' $apiPath

        # Find the newest zip in Deploy/
        $deployFolder = Join-Path $repoRoot 'Deploy'
        $newZip = Get-ChildItem -Path $deployFolder -Filter '*.zip' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($null -eq $newZip) {
            Write-Error "No zip found in $deployFolder after packaging."
            throw "Packaging failed"
        }
        Write-Output "Created API package: $($newZip.FullName)"
    } else { Write-Output "Skipping API package (SkipAPI)." }

    Write-Output "\nAll requested deploy-all steps completed successfully."
    exit 0
} catch {
    Write-Error "deploy-all failed: $_"
    exit 2
}
