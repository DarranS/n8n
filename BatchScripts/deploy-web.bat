@echo off
setlocal enabledelayedexpansion

:: Configuration
set "STAGE_ENV=stage"
set "PROD_ENV=production"
set "NODE_PATH=node"
set "NPM_PATH=npm"
set "DOCKER_PATH=docker"
set "DOCKER_COMPOSE_PATH=docker-compose"
set "AZURE_CLI_PATH=az"
set "SOURCE_DIR=..\esg-ai-viewer"
set "OUTPUT_DIR=..\deploy"
set "STAGE_DIR=%OUTPUT_DIR%\%STAGE_ENV%"
set "PROD_DIR=%OUTPUT_DIR%\%PROD_ENV%"

:: Function to check if a command exists
:checkCommand
    where %1 >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo Error: %1 is not installed or not in PATH
        exit /b 1
    )
    exit /b 0

:: Function to create directory if it doesn't exist
:createDir
    if not exist %1 (
        mkdir %1
        echo Created directory: %1
    )
    exit /b 0

:: Function to deploy to environment
:deploy
    set "TARGET_ENV=%~1"
    set "TARGET_DIR=%OUTPUT_DIR%\%TARGET_ENV%"
    
    echo.
    echo ===== Deploying to %TARGET_ENV% =====
    
    :: Create deployment directory
    call :createDir "%TARGET_DIR%"
    
    :: Copy source files
    echo Copying source files...
    xcopy /E /I /Y "%SOURCE_DIR%\*" "%TARGET_DIR%"
    
    :: Install dependencies and build
    echo Installing dependencies and building...
    cd "%TARGET_DIR%"
    
    if "%TARGET_ENV%"=="%STAGE_ENV%" (
        %NPM_PATH% install
        %NPM_PATH% run build:stage
    ) else (
        %NPM_PATH% install
        %NPM_PATH% run build:prod
    )
    
    :: Build Docker image
    echo Building Docker image...
    %DOCKER_PATH% build -t esg-ai-viewer:%TARGET_ENV% .
    
    :: Tag and push to Azure Container Registry
    echo Tagging and pushing to Azure Container Registry...
    %DOCKER_PATH% tag esg-ai-viewer:%TARGET_ENV% esgai.azurecr.io/esg-ai-viewer:%TARGET_ENV%
    %DOCKER_PATH% push esgai.azurecr.io/esg-ai-viewer:%TARGET_ENV%
    
    :: Deploy to AKS
    echo Deploying to AKS...
    kubectl apply -f k8s/config.yaml
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/service.yaml
    kubectl apply -f k8s/ingress.yaml
    
    :: Verify deployment
    echo Verifying deployment...
    kubectl get deployments
    kubectl get pods
    kubectl get services
    kubectl get ingress
    
    cd ..
    echo Deployment to %TARGET_ENV% completed successfully!
    exit /b 0

:: Main deployment process
echo Starting deployment process...

:: Check prerequisites
echo Checking prerequisites...
call :checkCommand %NODE_PATH%
call :checkCommand %NPM_PATH%
call :checkCommand %DOCKER_PATH%
call :checkCommand %DOCKER_COMPOSE_PATH%
call :checkCommand %AZURE_CLI_PATH%

:: Create output directory
call :createDir "%OUTPUT_DIR%"

:: Login to Azure
echo Logging in to Azure...
%AZURE_CLI_PATH% login
%AZURE_CLI_PATH% acr login --name esgai

:: Deploy to Stage
call :deploy %STAGE_ENV%
if %ERRORLEVEL% neq 0 (
    echo Error: Stage deployment failed
    exit /b 1
)

:: Deploy to Production
call :deploy %PROD_ENV%
if %ERRORLEVEL% neq 0 (
    echo Error: Production deployment failed
    exit /b 1
)

echo.
echo ===== Deployment completed successfully! =====
echo Stage environment: %STAGE_DIR%
echo Production environment: %PROD_DIR%

endlocal 