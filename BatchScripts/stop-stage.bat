@echo off
setlocal enabledelayedexpansion

set IMAGE_NAME=esg-ai-viewer

echo Stopping and removing containers...
docker stop %IMAGE_NAME% 2>nul
docker rm %IMAGE_NAME% 2>nul

echo Containers stopped and removed successfully.

endlocal 