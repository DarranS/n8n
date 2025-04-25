@echo off
setlocal enabledelayedexpansion

REM Set variables
set IMAGE_NAME=esg-ai-viewer
set BUILD_TAG=%date:~10,4%%date:~4,2%%date:~7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BUILD_TAG=%BUILD_TAG: =0%
set BUILD_TAG=%BUILD_TAG:/=-%

REM Wait for Docker to be ready
echo Waiting for Docker to be ready...
:DOCKER_WAIT_LOOP
docker ps >nul 2>&1
if errorlevel 1 (
    echo Docker not ready, waiting...
    timeout /t 2 /nobreak >nul
    goto DOCKER_WAIT_LOOP
)
echo Docker is ready

REM Change to the project directory
cd /d C:\DIF\AI\n8n\esg-ai-viewer

REM Build the Docker image with build information
echo Building Docker image with tag: %BUILD_TAG%
docker build ^
    --build-arg BUILD_TAG=%BUILD_TAG% ^
    --build-arg ENVIRONMENT=Staging ^
    -t %IMAGE_NAME%:latest ^
    -t %IMAGE_NAME%:%BUILD_TAG% ^
    -f Dockerfile .

REM Stop any existing container
echo Stopping existing container if running...
docker stop %IMAGE_NAME% 2>nul
docker rm %IMAGE_NAME% 2>nul

REM Check if port 4202 is in use
for /f "tokens=5" %%a in ('netstat -aon ^| find ":4202" ^| find "LISTENING"') do (
    echo [ERROR] Port 4202 is already in use
    echo Please free up port 4202 and try again
    exit /b 1
)

REM Run the container locally
echo Starting container locally...
docker run -d ^
    --name %IMAGE_NAME% ^
    -p 4202:80 ^
    -e BUILD_TAG=%BUILD_TAG% ^
    -e ENVIRONMENT=Staging ^
    %IMAGE_NAME%:latest

if errorlevel 1 (
    echo Error: Failed to start container
    echo Please ensure port 4202 is available and try again
    exit /b 1
)

echo Stage deployment completed successfully
echo Build Tag: %BUILD_TAG%
echo Environment: Staging
echo Application is running at http://localhost:4202

REM Return to original directory
cd /d %~dp0

endlocal