@echo off
setlocal

echo =======================================================
echo   VoiceShield AI - Live Public Deployment Generator
echo =======================================================
echo.
echo Starting VoiceShield application locally...
start "VoiceShield Backend" /D "%~dp0backend" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
start "VoiceShield Frontend" /D "%~dp0frontend" cmd /k "npm run dev -- --host 0.0.0.0 --port 5173"

echo Waiting 5 seconds for services to boot...
timeout /t 5 /nobreak >nul

echo.
echo Launching public HTTPS tunnel for Frontend (Port 5173)...
echo Share the generated URL with judges, evaluators, or users.
echo.
npx -y localtunnel --port 5173

endlocal
