@echo off
setlocal enabledelayedexpansion

:: Configuration
set "STAGE_ENV=stage"
set "PROD_ENV=production"
set "PYTHON_PATH=python"
set "PIP_PATH=pip"
set "REQUIREMENTS_FILE=requirements.txt"
set "SOURCE_DIR=..\PythonCode\ESGFlat\Python"
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
    
    :: Install dependencies
    echo Installing dependencies...
    %PIP_PATH% install -r "%TARGET_DIR%\%REQUIREMENTS_FILE%"
    
    :: Run tests (if any)
    echo Running tests...
    %PYTHON_PATH% "%TARGET_DIR%\ESGCompanyWorkflow.py"
    if %ERRORLEVEL% neq 0 (
        echo Error: Tests failed for %TARGET_ENV%
        exit /b 1
    )
    
    echo Deployment to %TARGET_ENV% completed successfully!
    exit /b 0

:: Main deployment process
echo Starting deployment process...

:: Check prerequisites
echo Checking prerequisites...
call :checkCommand %PYTHON_PATH%
call :checkCommand %PIP_PATH%

:: Create output directory
call :createDir "%OUTPUT_DIR%"

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