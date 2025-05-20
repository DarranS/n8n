# Environment setup script for ESG AI Viewer

# Staging environment variables
$STAGE_CLIENT_ID = "7425393c-f84e-435c-83e5-c76aec2230c4"
$STAGE_AUTHORITY = "https://login.microsoftonline.com/common"
$STAGE_REDIRECT_URI = "http://localhost:8080"

# Production environment variables
$PROD_CLIENT_ID = "200b5caf-1971-4d5c-9d82-2a2b1dadc626"
$PROD_AUTHORITY = "https://login.microsoftonline.com/common"
$PROD_REDIRECT_URI = "https://esgaiviewer.sheltononline.com"

# Create or update staging environment file
@"
# Azure AD Authentication
AUTH_CLIENT_ID=$STAGE_CLIENT_ID
AUTH_AUTHORITY=$STAGE_AUTHORITY
AUTH_REDIRECT_URI=$STAGE_REDIRECT_URI

# Environment
NODE_ENV=staging
PORT=8080
"@ | Out-File -FilePath ".env.stage" -Encoding utf8

# Create or update production environment file
@"
# Azure AD Authentication
AUTH_CLIENT_ID=$PROD_CLIENT_ID
AUTH_AUTHORITY=$PROD_AUTHORITY
AUTH_REDIRECT_URI=$PROD_REDIRECT_URI

# Environment
NODE_ENV=production
PORT=80
"@ | Out-File -FilePath ".env.prod" -Encoding utf8

# Update environment.ts files with the correct values
# Staging environment
$stageEnvContent = Get-Content "src/environments/environment.stage.ts" -Raw
$stageEnvContent = $stageEnvContent -replace '\${STAGE_CLIENT_ID}', $STAGE_CLIENT_ID
$stageEnvContent | Out-File "src/environments/environment.stage.ts" -Encoding utf8

# Production environment
$prodEnvContent = Get-Content "src/environments/environment.prod.ts" -Raw
$prodEnvContent = $prodEnvContent -replace '\${PROD_CLIENT_ID}', $PROD_CLIENT_ID
$prodEnvContent | Out-File "src/environments/environment.prod.ts" -Encoding utf8

Write-Host "Environment setup completed successfully!"
Write-Host "Staging environment configured with Client ID: $STAGE_CLIENT_ID"
Write-Host "Production environment configured with Client ID: $PROD_CLIENT_ID" 