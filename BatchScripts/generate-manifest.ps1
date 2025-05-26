# PowerShell script to generate manifest.json for company data files
# Scans all .json files in the data directory (except manifest.json itself)
# and writes a manifest.json file listing all the JSON filenames.

$DataDir = "../esg-ai-viewer/src/assets/data"
$ManifestPath = "$DataDir/manifest.json"

# Get all .json files except manifest.json
$files = Get-ChildItem -Path $DataDir -Filter *.json | Where-Object { $_.Name -ne "manifest.json" } | Sort-Object Name | Select-Object -ExpandProperty Name

# Convert to JSON array
$json = $files | ConvertTo-Json -Compress

# Write to manifest.json
Set-Content -Path $ManifestPath -Value $json -Encoding UTF8

Write-Host "Manifest generated at $ManifestPath with $($files.Count) files." 