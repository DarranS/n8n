@echo off
setlocal enabledelayedexpansion

REM Set variables
set REGISTRY=esgai.azurecr.io
set IMAGE_NAME=esg-ai-viewer
set BUILD_TAG=%date:~10,4%%date:~4,2%%date:~7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BUILD_TAG=%BUILD_TAG: =0%

REM Build the Docker image with build information
echo Building Docker image with tag: %BUILD_TAG%
docker build ^
    --build-arg BUILD_TAG=%BUILD_TAG% ^
    -t %REGISTRY%/%IMAGE_NAME%:latest ^
    -t %REGISTRY%/%IMAGE_NAME%:%BUILD_TAG% ^
    -f Dockerfile .

REM Push the images to Azure Container Registry
echo Pushing images to Azure Container Registry
docker push %REGISTRY%/%IMAGE_NAME%:latest
docker push %REGISTRY%/%IMAGE_NAME%:%BUILD_TAG%

REM Update Kubernetes deployment
echo Updating Kubernetes deployment
kubectl set image deployment/%IMAGE_NAME% %IMAGE_NAME%=%REGISTRY%/%IMAGE_NAME%:%BUILD_TAG%

echo Deployment completed successfully
echo Build Tag: %BUILD_TAG%

endlocal 