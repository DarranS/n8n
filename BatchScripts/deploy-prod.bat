@echo off
setlocal enabledelayedexpansion

echo [INFO] Updating production config ConfigMap...
kubectl create configmap esg-ai-viewer-config --from-file=config.json=..\esg-ai-viewer\src\assets\config\config.production.json -n n8n --dry-run=client -o yaml > ..\esg-ai-viewer\k8s\esg-ai-viewer-configmap.yaml
kubectl apply -f ..\esg-ai-viewer\k8s\esg-ai-viewer-configmap.yaml
if errorlevel 1 (
    echo [ERROR] Failed to update config ConfigMap
    exit /b 1
)

echo [INFO] Copying production configuration...
copy /Y ..\esg-ai-viewer\src\assets\config\config.production.json ..\esg-ai-viewer\src\assets\config\config.json
if errorlevel 1 (
    echo [ERROR] Failed to copy production config
    exit /b 1
)

:: Set the base directory
set "BASE_DIR=%~dp0..\n8n-kubernetes-hosting"
set "REGISTRY=esgai.azurecr.io"
set "IMAGE_NAME=esg-ai-viewer"

echo [INFO] Starting production deployment...
echo [INFO] Using staged image...

:: Login to Azure Container Registry
echo [INFO] Logging in to Azure Container Registry...
call az acr login -n esgai --expose-token
if errorlevel 1 (
    echo [ERROR] Failed to login to Azure Container Registry
    exit /b 1
)

:: Get the latest staged image tag (excluding 'latest' and 'prod-')
for /f %%i in ('docker images esg-ai-viewer --format "{{.Tag}}" ^| findstr /v "latest" ^| findstr /r "^[0-9]" ^| sort /r ^| findstr . 2^>nul') do (
    set "STAGED_BUILD_TAG=%%i"
    goto :found_tag
)
:found_tag

if "!STAGED_BUILD_TAG!"=="" (
    echo [ERROR] Could not find tag for staged image
    exit /b 1
)

echo [INFO] Using Build Tag from staging: !STAGED_BUILD_TAG!

:: Tag the latest local image with the registry prefix
docker tag esg-ai-viewer:!STAGED_BUILD_TAG! %REGISTRY%/%IMAGE_NAME%:!STAGED_BUILD_TAG!
if errorlevel 1 (
    echo [ERROR] Failed to tag image for registry
    exit /b 1
)

:: Image is already tagged with registry name, no need to tag again
echo [INFO] Using already tagged image...

:: Push to Azure Container Registry
echo [INFO] Pushing to Azure Container Registry...
call docker push %REGISTRY%/%IMAGE_NAME%:!STAGED_BUILD_TAG!
if errorlevel 1 (
    echo [ERROR] Failed to push image
    exit /b 1
)

:: Deploy to AKS
echo [INFO] Deploying to AKS...

:: Apply Kubernetes configurations
echo [INFO] Applying Kubernetes configurations...

:: Apply namespace
echo [INFO] Applying namespace...
call kubectl apply -f "%BASE_DIR%\namespace.yaml"
if errorlevel 1 (
    echo [ERROR] Failed to apply namespace
    exit /b 1
)

:: Apply cluster issuer
echo [INFO] Applying cluster issuer...
call kubectl apply -f "%BASE_DIR%\cluster-issuer.yaml"
if errorlevel 1 (
    echo [ERROR] Failed to apply cluster issuer
    exit /b 1
)

:: Apply postgres configurations
echo [INFO] Applying postgres configurations...
call kubectl apply -f "%BASE_DIR%\postgres-configmap.yaml"
call kubectl apply -f "%BASE_DIR%\postgres-secret.yaml"
call kubectl apply -f "%BASE_DIR%\postgres-claim0-persistentvolumeclaim.yaml"
call kubectl apply -f "%BASE_DIR%\postgres-deployment.yaml"
call kubectl apply -f "%BASE_DIR%\postgres-service.yaml"

:: Apply n8n configurations
echo [INFO] Applying n8n configurations...
call kubectl apply -f "%BASE_DIR%\n8n-claim0-persistentvolumeclaim.yaml"
call kubectl apply -f "%BASE_DIR%\n8n-service.yaml"
call kubectl apply -f "%BASE_DIR%\n8n-deployment.yaml"
call kubectl apply -f "%BASE_DIR%\n8n-ingress.yaml"

:: Apply ESG AI Viewer configurations
echo [INFO] Applying ESG AI Viewer configurations...
call kubectl apply -f "%BASE_DIR%\esg-ai-viewer-service-account.yaml"
REM call kubectl apply -f "%BASE_DIR%\esg-ai-viewer-deployment.yaml"
call kubectl apply -f "C:\DIF\AI\n8n\esg-ai-viewer\k8s\deployment.yaml"
call kubectl apply -f "%BASE_DIR%\esg-ai-viewer-service.yaml"
call kubectl apply -f "%BASE_DIR%\esg-ai-viewer-ingress.yaml"

:: Update deployment with new tag
echo [INFO] Updating deployment with new tag...
call kubectl set image deployment/esg-ai-viewer -n n8n esg-ai-viewer=%REGISTRY%/%IMAGE_NAME%:!STAGED_BUILD_TAG!
if errorlevel 1 (
    echo [ERROR] Failed to update deployment image
    exit /b 1
)

:: Wait for rollout to complete
echo [INFO] Waiting for deployment rollout to complete...
call kubectl rollout status deployment/esg-ai-viewer -n n8n --timeout=300s
if errorlevel 1 (
    echo [ERROR] Deployment rollout failed
    exit /b 1
)

echo [INFO] Production deployment completed successfully!
echo [INFO] Image: %REGISTRY%/%IMAGE_NAME%:!STAGED_BUILD_TAG!
echo [INFO] Build Tag: !STAGED_BUILD_TAG!

endlocal 