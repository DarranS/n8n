@echo off
setlocal enabledelayedexpansion

:: Get current timestamp for unique tag
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,8%-%datetime:~8,6%

echo Waiting for Docker to be ready...
docker ps >nul 2>&1
if errorlevel 1 (
    echo Docker is not running. Please start Docker and try again.
    exit /b 1
)
echo Docker is ready

echo Copying staging configuration...
copy /Y ..\esg-ai-viewer\src\assets\config\config.staging.json ..\esg-ai-viewer\src\assets\config\config.json

echo Building Docker image with tag: %timestamp%
docker build -t esg-ai-viewer:latest -t esg-ai-viewer:%timestamp% --build-arg ENVIRONMENT=Staging --build-arg BUILD_TAG=%timestamp% ..\esg-ai-viewer

echo Stopping existing container if running...
docker stop esg-ai-viewer
docker rm esg-ai-viewer

echo Starting container locally...
docker run -d --name esg-ai-viewer -p 4202:8080 esg-ai-viewer:latest

echo Stage deployment completed successfully
echo Build Tag: %timestamp%
echo Environment: Staging
echo Application is running at http://localhost:4202

REM Return to original directory
cd /d %~dp0

endlocal