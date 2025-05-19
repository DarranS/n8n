# Read the environment.dev.ts file
$envFile = Get-Content ..\esg-ai-viewer\src\environments\environment.dev.ts -Raw

# Extract the object between the first { and the last }
$start = $envFile.IndexOf('{')
$end = $envFile.LastIndexOf('}')
if ($start -ge 0 -and $end -gt $start) {
    $envContent = $envFile.Substring($start, $end - $start + 1)

    # Remove comments
    $envContent = $envContent -replace '(?m)//.*$',''
    $envContent = $envContent -replace '/\*[\s\S]*?\*/', ''

    # Add quotes to property names (only those not already quoted)
    $envContent = $envContent -replace '([,{]\s*)([a-zA-Z0-9_]+)\s*:', '$1"$2":'

    # Convert single quotes to double quotes
    $envContent = $envContent -replace "'([^']*)'", '"$1"'

    # Remove trailing commas
    $envContent = $envContent -replace ',(\s*[}\]])', '$1'

    # Try to parse as JSON
    try {
        $configObj = $envContent | ConvertFrom-Json
        $configObj | Add-Member -NotePropertyName "environment" -NotePropertyValue "Development" -Force
        $finalJson = $configObj | ConvertTo-Json -Depth 10
        $finalJson
    }
    catch {
        Write-Error "Failed to process JSON: $_"
        exit 1
    }
} else {
    Write-Error "Could not parse environment.dev.ts"
    exit 1
}