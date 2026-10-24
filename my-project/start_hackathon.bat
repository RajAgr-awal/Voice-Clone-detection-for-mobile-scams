@echo off
setlocal

echo Starting VoiceShield AI hackathon workspace...
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.

start "VoiceShield Backend" /D "%~dp0backend" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
start "VoiceShield Frontend" /D "%~dp0frontend" cmd /k "npm run dev -- --host 0.0.0.0 --port 5173"

endlocal
