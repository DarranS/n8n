@echo off
setlocal

echo Checking required tools...

where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo Error: npm is not installed or not in PATH
    exit /b 1
)

where docker >nul 2>nul
if errorlevel 1 (
    echo Error: Docker is not installed or not in PATH
    exit /b 1
)

where docker-compose >nul 2>nul
if errorlevel 1 (
    echo Error: Docker Compose is not installed or not in PATH
    exit /b 1
)

where az >nul 2>nul
if errorlevel 1 (
    echo Error: Azure CLI is not installed or not in PATH
    exit /b 1
)

echo All tools are available.

:: Change to esg-ai-viewer directory
cd ..
if not exist esg-ai-viewer (
    echo Error: esg-ai-viewer directory not found
    exit /b 1
)
cd esg-ai-viewer

:: Install dependencies and build
echo Installing dependencies and building...
call npm install
if errorlevel 1 (
    echo Error: npm install failed
    exit /b 1
)

call npm run build:stage
if errorlevel 1 (
    echo Error: npm build failed
    exit /b 1
)

:: Build and deploy using docker-compose
echo Building and deploying with docker-compose...
docker-compose -f docker-compose.stage.yml up --build -d
if errorlevel 1 (
    echo Error: Docker deployment failed
    exit /b 1
)

echo Stage deployment completed successfully!
endlocal 