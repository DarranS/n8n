@echo off
setlocal enabledelayedexpansion

:: Get current timestamp for unique tag
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,8%-%datetime:~8,6%

echo [INFO] Starting production deployment...
echo [INFO] Using tag: %timestamp%
echo [INFO] Checking required tools...

:: Create a temporary environment file with the build tag
echo [INFO] Creating environment file with build tag...
echo window.__BUILD_TAG__ = '%timestamp%'; > src/assets/env.js
if errorlevel 1 (
    echo [ERROR] Failed to create environment file
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in PATH
    exit /b 1
)

where docker >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    exit /b 1
)

where docker-compose >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed or not in PATH
    exit /b 1
)

where az >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Azure CLI is not installed or not in PATH
    exit /b 1
)

where kubectl >nul 2>nul
if errorlevel 1 (
    echo [ERROR] kubectl is not installed or not in PATH
    exit /b 1
)

echo [INFO] All tools are available.

:: Check Kubernetes configuration
echo [INFO] Checking Kubernetes configuration...
kubectl config current-context >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Kubernetes is not configured. Please run 'az aks get-credentials' to configure kubectl
    exit /b 1
)

:: Change to esg-ai-viewer directory
echo [INFO] Changing to project directory...
cd ..
if not exist esg-ai-viewer (
    echo [ERROR] esg-ai-viewer directory not found
    exit /b 1
)
cd esg-ai-viewer

:: Install dependencies and build
echo [INFO] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed
    exit /b 1
)

echo [INFO] Building production version...
call npm run build:prod
if errorlevel 1 (
    echo [ERROR] Production build failed
    exit /b 1
)

:: Login to Azure Container Registry
echo [INFO] Logging in to Azure Container Registry...
call az acr login --name esgai
if errorlevel 1 (
    echo [ERROR] Azure Container Registry login failed
    exit /b 1
)

:: Build and push Docker image
echo [INFO] Building Docker image...
docker build --progress=plain --build-arg BUILD_TAG=%timestamp% -t esg-ai-viewer:%timestamp% .
if errorlevel 1 (
    echo [ERROR] Docker build failed
    exit /b 1
)

echo [INFO] Tagging and pushing Docker image...
docker tag esg-ai-viewer:%timestamp% esgai.azurecr.io/esg-ai-viewer:%timestamp%
docker push esgai.azurecr.io/esg-ai-viewer:%timestamp%
if errorlevel 1 (
    echo [ERROR] Docker push failed
    exit /b 1
)

:: Update deployment image
echo [INFO] Updating deployment image...
kubectl set image deployment/esg-ai-viewer esg-ai-viewer=esgai.azurecr.io/esg-ai-viewer:%timestamp% --record
if errorlevel 1 (
    echo [ERROR] Failed to update deployment image
    exit /b 1
)

:: Force pull new image by patching imagePullPolicy
echo [INFO] Forcing new image pull...
kubectl patch deployment esg-ai-viewer -p "{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"esg-ai-viewer\",\"imagePullPolicy\":\"Always\"}]}}}}"
if errorlevel 1 (
    echo [ERROR] Failed to patch deployment
    exit /b 1
)

:: Check if Kubernetes files exist
if not exist k8s (
    echo [ERROR] Kubernetes configuration directory 'k8s' not found
    exit /b 1
)

:: Deploy to AKS
echo [INFO] Deploying to AKS...
echo [INFO] Applying Kubernetes configurations...

if exist k8s/config.yaml (
    echo [INFO] Applying config...
    kubectl apply -f k8s/config.yaml
    if errorlevel 1 (
        echo [ERROR] Kubernetes config deployment failed
        exit /b 1
    )
)

:: Force restart of pods to pick up ConfigMap changes
echo [INFO] Restarting pods to apply ConfigMap changes...
kubectl rollout restart deployment esg-ai-viewer
if errorlevel 1 (
    echo [ERROR] Failed to restart deployment
    exit /b 1
)

if exist k8s/deployment.yaml (
    echo [INFO] Applying deployment...
    kubectl apply -f k8s/deployment.yaml
    if errorlevel 1 (
        echo [ERROR] Kubernetes deployment failed
        exit /b 1
    )
)

if exist k8s/service.yaml (
    echo [INFO] Applying service...
    kubectl apply -f k8s/service.yaml
    if errorlevel 1 (
        echo [ERROR] Kubernetes service deployment failed
        exit /b 1
    )
)

if exist k8s/ingress.yaml (
    echo [INFO] Applying ingress...
    kubectl apply -f k8s/ingress.yaml
    if errorlevel 1 (
        echo [ERROR] Kubernetes ingress deployment failed
        exit /b 1
    )
)

:: Wait for rollout to complete
echo [INFO] Waiting for deployment rollout to complete...
kubectl rollout status deployment/esg-ai-viewer --timeout=120s
if errorlevel 1 (
    echo [ERROR] Deployment rollout failed
    exit /b 1
)

:: Verify deployment
echo [INFO] Verifying deployment...
echo [INFO] Current deployments:
kubectl get deployments
if errorlevel 1 (
    echo [ERROR] Failed to get deployments
    exit /b 1
)

echo.
echo [INFO] Current pods:
kubectl get pods
if errorlevel 1 (
    echo [ERROR] Failed to get pods
    exit /b 1
)

echo.
echo [INFO] Current services:
kubectl get services
if errorlevel 1 (
    echo [ERROR] Failed to get services
    exit /b 1
)

echo.
echo [INFO] Current ingress:
kubectl get ingress
if errorlevel 1 (
    echo [ERROR] Failed to get ingress
    exit /b 1
)

:: Check TLS certificate status
echo.
echo [INFO] Checking TLS certificate status...
kubectl get certificate esg-ai-viewer-tls-prod
if errorlevel 1 (
    echo [ERROR] Failed to get certificate status
    exit /b 1
)

:: Wait for pods to be ready
echo.
echo [INFO] Waiting for pods to be ready...
timeout /t 60 /nobreak >nul
kubectl wait --for=condition=ready pod -l app=esg-ai-viewer --timeout=60s
if errorlevel 1 (
    echo [ERROR] Pods did not become ready in time
    exit /b 1
)

:: Health check
echo.
echo [INFO] Performing health check...
curl -k -s -o nul -w "%%{http_code}" https://esgaiviewer.sheltononline.com
if errorlevel 1 (
    echo [ERROR] Health check failed
    exit /b 1
)

echo [SUCCESS] Production deployment completed successfully!
endlocal 