param(
    [string]$SourceFolder = "KC_API/api",
    [string]$OutFolder = "Deploy",
    [string]$ZipName = "",
    [string[]]$Patterns = @('server.js','logger.js','Procfile','*.json','package.json')
)

Set-StrictMode -Version Latest

try {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $repoRoot = (Resolve-Path (Join-Path $scriptDir ".." )).Path
    $sourcePath = (Resolve-Path (Join-Path $repoRoot $SourceFolder)).Path
} catch {
    Write-Error "Failed to resolve paths. Error: $_"
    exit 1
}

# Find 7-Zip
$sevenCandidates = @('C:\Program Files\7-Zip\7z.exe','C:\Program Files (x86)\7-Zip\7z.exe','7z')
$seven = $null
foreach ($c in $sevenCandidates) { if (Test-Path $c) { $seven = $c; break } ; try { if (Get-Command $c -ErrorAction SilentlyContinue) { $seven = $c; break } } catch { } }
if (-not $seven) { Write-Error "7-Zip not found."; exit 2 }

if ([string]::IsNullOrWhiteSpace($ZipName)) { $ts = Get-Date -Format yyyyMMdd-HHmmss; $ZipName = "kickconnect-api-minimal-$ts.zip" }
$outFolderPath = Join-Path $repoRoot $OutFolder
if (-not (Test-Path $outFolderPath)) { New-Item -ItemType Directory -Path $outFolderPath | Out-Null }
$outPath = Join-Path $outFolderPath $ZipName

# Prepare temp folder
$tmp = Join-Path $env:TEMP ([GUID]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tmp | Out-Null

try {
    # Copy matching files (top-level) from sourcePath into temp
    foreach ($p in $Patterns) {
        $found = Get-ChildItem -Path $sourcePath -Filter $p -File -ErrorAction SilentlyContinue
        foreach ($m in $found) {
            $dest = Join-Path $tmp $m.Name
            Copy-Item $m.FullName $dest -Force
        }
    }

    # Also copy Procfile if exists (some systems may treat it as no extension)
    if (Test-Path (Join-Path $sourcePath 'Procfile')) {
        Copy-Item (Join-Path $sourcePath 'Procfile') (Join-Path $tmp 'Procfile') -Force
    }

    Push-Location $tmp
    & $seven a -tzip $outPath * -r -mx=9 | Write-Output
    Pop-Location
} catch {
    Write-Error "Failed to create whitelist zip: $_"
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    exit 3
}

Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue

if (Test-Path $outPath) {
    Write-Output "Created whitelist zip: $outPath"
    & $seven l $outPath | Write-Output
    exit 0
} else {
    Write-Error "Whitelist zip not created: $outPath"
    exit 4
}
