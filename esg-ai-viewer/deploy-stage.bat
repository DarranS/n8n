@echo off
setlocal enabledelayedexpansion

REM Remove existing container if it exists
docker rm -f esg-ai-viewer 2>nul

REM Set variables
set REGISTRY=esgai.azurecr.io
set IMAGE_NAME=esg-ai-viewer
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BUILD_TAG=%datetime:~0,8%-%datetime:~8,6%

REM Copy production config
copy /Y src\assets\config\config.production.json src\assets\config\config.json

REM Build the Docker image with build information
echo Building Docker image with tag: %BUILD_TAG%
docker build ^
    --build-arg BUILD_TAG=%BUILD_TAG% ^
    --build-arg ENVIRONMENT=Staging ^
    -t %REGISTRY%/%IMAGE_NAME%:latest ^
    -t %REGISTRY%/%IMAGE_NAME%:%BUILD_TAG% ^
    -f Dockerfile .

REM Run the container locally
echo Running container locally on port 4202
docker run -d --name %IMAGE_NAME% -p 4202:8080 %REGISTRY%/%IMAGE_NAME%:%BUILD_TAG%

echo Deployment completed successfully
echo Build Tag: %BUILD_TAG%
echo Application is running at http://localhost:4202

endlocal 