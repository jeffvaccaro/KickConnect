param(
    [string]$SourceFolder = "KC_API/api",
    [string]$OutFolder = "Deploy",
    [string]$ZipName = "",
    [switch]$IncludeNodeModules
)

<#
  package-api.ps1
  Creates a zip suitable for Elastic Beanstalk from the API subtree using 7-Zip.

  Usage (from repo root):
    pwsh -File .\scripts\package-api.ps1
    # or with PowerShell (Windows):
    powershell -ExecutionPolicy Bypass -File .\scripts\package-api.ps1

  Options:
    -SourceFolder  Path to the folder to package (relative to repo root). Default: KC_API/api
    -OutFolder     Folder to place zip (relative to repo root). Default: Deploy
    -ZipName       Optional explicit zip filename. If omitted a timestamped name is used.
    -IncludeNodeModules  If present, node_modules will be included (not recommended for EB).

#>

Set-StrictMode -Version Latest

try {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $repoRoot = (Resolve-Path (Join-Path $scriptDir ".." )).Path

    $sourcePath = (Resolve-Path (Join-Path $repoRoot $SourceFolder)).Path
} catch {
    Write-Error "Failed to resolve paths. Ensure the script is located under the repository's scripts/ folder and run from any location. Error: $_"
    exit 1
}

# Ensure 7-Zip exists
$sevenCandidates = @(
    'C:\Program Files\7-Zip\7z.exe',
    'C:\Program Files (x86)\7-Zip\7z.exe',
    '7z'
)

$seven = $null
foreach ($c in $sevenCandidates) {
    if (Test-Path $c) { $seven = $c; break }
    # if '7z' exists in PATH, Resolve-Path will handle it
    try { if ((Get-Command $c -ErrorAction SilentlyContinue)) { $seven = $c; break } } catch { }
}

if (-not $seven) {
    Write-Error "7-Zip not found. Install 7-Zip or ensure '7z' is in PATH. Typical path: C:\Program Files\7-Zip\7z.exe"
    exit 2
}

# Ensure output folder exists
$outFolderPath = Join-Path $repoRoot $OutFolder
if (-not (Test-Path $outFolderPath)) { New-Item -ItemType Directory -Path $outFolderPath | Out-Null }

if ([string]::IsNullOrWhiteSpace($ZipName)) {
    # Use a stable base filename and append a numeric suffix if the file already exists
    $baseName = 'KC-EB-Deploy-FULL'
    $ext = '.zip'
    $candidate = Join-Path $outFolderPath ("$baseName$ext")
    $counter = 1
    while (Test-Path $candidate) {
        $candidate = Join-Path $outFolderPath ("{0}-{1}{2}" -f $baseName, $counter, $ext)
        $counter++
    }
    $ZipName = Split-Path $candidate -Leaf
}

$outPath = Join-Path $outFolderPath $ZipName

Write-Output "Packaging $sourcePath -> $outPath using 7z: $seven"

try {
    Push-Location $sourcePath

    # If node_modules should be excluded, ensure it's not included in the archive by default; we archive all files in the folder.
    # Use -mx=9 for max compression; -r to recurse.
    if ($IncludeNodeModules) {
        & $seven a -tzip $outPath * -r -mx=9 | Write-Output
    } else {
        # Exclude node_modules, .env files, and uploads directory by default
        # Build exclusion args as literals to avoid PowerShell wildcard expansion
        $excludeArgs = @(
            '-xr!node_modules',
            '-xr!.env',
            '-xr!.env.*',
            '-xr!uploads',
            '-xr!uploads\*'
        )

        & $seven a -tzip $outPath * -r -mx=9 @excludeArgs | Write-Output
    }

    Pop-Location
} catch {
    Write-Error "Failed to create zip. You may have a file lock (EBUSY). Close Editors or tools that hold files and retry. Error: $_"
    exit 3
}

if (Test-Path $outPath) {
    Write-Output "Created: $outPath"
    Write-Output "Contents:"
    & $seven l $outPath | Write-Output
    Write-Output "Done. The zip is placed in: $outFolderPath"
    exit 0
} else {
    Write-Error "Zip creation failed: $outPath not found after archive step."
    exit 4
}
