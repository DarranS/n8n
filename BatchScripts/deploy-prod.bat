@echo off
setlocal enabledelayedexpansion

:: Get current timestamp for unique tag
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,8%-%datetime:~8,6%

echo [INFO] Starting production deployment...
echo [INFO] Using staged image...

:: Login to Azure Container Registry
echo [INFO] Logging in to Azure Container Registry...
call az acr login --name esgai
if errorlevel 1 (
    echo [ERROR] Failed to login to Azure Container Registry
    exit /b 1
)

:: Get the latest staged image tag
for /f %%i in ('docker images esg-ai-viewer:latest --format "{{.ID}}"') do set "IMAGE_ID=%%i"
if "%IMAGE_ID%"=="" (
    echo [ERROR] No staged image found
    exit /b 1
)

:: Use the latest tag from staging (4-02-183110)
set "STAGED_BUILD_TAG=4-02-183110"

echo [INFO] Using Build Tag from staging: !STAGED_BUILD_TAG!

:: Tag the staged image for production
echo [INFO] Tagging staged image for production...
call docker tag esg-ai-viewer:latest esgai.azurecr.io/esg-ai-viewer:prod-%timestamp%
if errorlevel 1 (
    echo [ERROR] Failed to tag image
    exit /b 1
)

:: Push to Azure Container Registry
echo [INFO] Pushing to Azure Container Registry...
call docker push esgai.azurecr.io/esg-ai-viewer:prod-%timestamp%
if errorlevel 1 (
    echo [ERROR] Failed to push image
    exit /b 1
)

:: Update deployment with new tag and preserve BUILD_TAG
echo [INFO] Updating deployment with new tag...
call kubectl set image deployment/esg-ai-viewer esg-ai-viewer=esgai.azurecr.io/esg-ai-viewer:prod-%timestamp%
if errorlevel 1 (
    echo [ERROR] Failed to update deployment image
    exit /b 1
)

:: Deploy to AKS
echo [INFO] Deploying to AKS...

:: Apply Kubernetes configurations
echo [INFO] Applying Kubernetes configurations...

:: Apply config
echo [INFO] Applying config...
call kubectl apply -f ..\esg-ai-viewer\k8s\config.yaml
if errorlevel 1 (
    echo [ERROR] Failed to apply config
    exit /b 1
)

:: Restart pods to apply ConfigMap changes
echo [INFO] Restarting pods to apply ConfigMap changes...
call kubectl rollout restart deployment esg-ai-viewer
if errorlevel 1 (
    echo [ERROR] Failed to restart deployment
    exit /b 1
)

:: Apply deployment with production environment and preserve BUILD_TAG
echo [INFO] Applying deployment...
call kubectl set env deployment/esg-ai-viewer ENVIRONMENT=Production BUILD_TAG=!STAGED_BUILD_TAG!
if errorlevel 1 (
    echo [ERROR] Failed to set environment variables
    exit /b 1
)

:: Apply service
echo [INFO] Applying service...
call kubectl apply -f ..\esg-ai-viewer\k8s\service.yaml
if errorlevel 1 (
    echo [ERROR] Failed to apply service
    exit /b 1
)

:: Apply ingress
echo [INFO] Applying ingress...
call kubectl apply -f ..\esg-ai-viewer\k8s\ingress.yaml
if errorlevel 1 (
    echo [ERROR] Failed to apply ingress
    exit /b 1
)

:: Wait for rollout to complete
echo [INFO] Waiting for deployment rollout to complete...
call kubectl rollout status deployment/esg-ai-viewer --timeout=300s
if errorlevel 1 (
    echo [ERROR] Deployment rollout failed
    exit /b 1
)

echo [INFO] Production deployment completed successfully!
echo [INFO] Image: esgai.azurecr.io/esg-ai-viewer:prod-%timestamp%
echo [INFO] Build Tag: !STAGED_BUILD_TAG!

endlocal 