@echo off
echo ==========================================
echo Starting NyayNow Application Services...
echo ==========================================

echo [1/3] Starting Python AI Service...
start "NyayNow - Python AI Service" cmd /k "cd /d "%~dp0python service" && python -m uvicorn ml_api:app --port 8000"

echo [2/3] Starting Backend Node Server...
start "NyayNow - Backend Server" cmd /k "cd /d "%~dp0server" && npm run dev"

echo [3/3] Starting Frontend Client...
start "NyayNow - Frontend Client" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo Waiting 5 seconds for services to initialize...
timeout /t 5 >nul

echo Opening NyayNow in your browser...
start http://localhost:3000

echo ==========================================
echo All services launched!
echo Keep the opened terminal windows running.
echo ==========================================
pause
