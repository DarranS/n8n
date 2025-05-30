# PowerShell script to generate CompanyUniverse.json for company data files
# Scans all .json files in the data directory (except CompanyUniverse.json itself)
# and writes a CompanyUniverse.json file listing all the JSON filenames.

$DataDir = "../esg-ai-viewer/src/assets/data"
$CompanyUniversePath = "$DataDir/CompanyUniverse.json"

# Get all .json files except CompanyUniverse.json
$files = Get-ChildItem -Path $DataDir -Filter *.json | Where-Object { $_.Name -ne "CompanyUniverse.json" } | Sort-Object Name | Select-Object -ExpandProperty Name

# Convert to JSON array
$json = $files | ConvertTo-Json -Compress

# Write to CompanyUniverse.json
Set-Content -Path $CompanyUniversePath -Value $json -Encoding UTF8

Write-Host "CompanyUniverse generated at $CompanyUniversePath with $($files.Count) files." 