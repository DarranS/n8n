@echo off
setlocal enabledelayedexpansion

echo Setting up ESG AI Viewer for local development...

echo Copying config.development.json to config.json...
copy /Y ..\esg-ai-viewer\src\assets\config\config.development.json ..\esg-ai-viewer\src\assets\config\config.json

if %ERRORLEVEL% NEQ 0 (
    echo Failed to copy development configuration!
    exit /b 1
)

echo Development configuration applied successfully.
echo Config location: ..\esg-ai-viewer\src\assets\config\config.json

endlocal