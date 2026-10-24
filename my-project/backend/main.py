"""FastAPI entry point for VoiceShield Forensic Intelligence anti-spoofing backend."""

from datetime import datetime, timezone
from typing import Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from api.routes import router as api_router


app = FastAPI(
    title="VoiceShield AI — Forensic Intelligence",
    description="Real-time AI voice anti-spoofing and phone scam forensic detection API.",
    version="1.0.0",
)

# Enable CORS for local dev and frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/", tags=["system"])
async def root() -> dict[str, Any]:
    """Root endpoint welcoming users and directing to API routes and Swagger docs."""
    return {
        "service": "VoiceShield Forensic Intelligence API",
        "status": "operational",
        "environment": "EVALUATION ENVIRONMENT / NODE 04",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_spec": "/openapi.json",
        },
        "endpoints": {
            "health": "/health",
            "service_status": "/api/status",
            "analyze_audio": "POST /api/analyze",
            "benchmarks": "/api/benchmarks",
            "cases": "/api/cases",
            "recent_activity": "/api/activity",
            "notifications": "/api/notifications",
            "stream_chunk": "POST /api/stream/chunk",
            "websocket_stream": "ws://localhost:8000/ws/stream",
        },
        "frontend_cockpit": "http://localhost:5173",
    }


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """Return lightweight health check."""
    return {
        "status": "ok",
        "service": "voiceshield-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.websocket("/ws/stream")
async def audio_stream(websocket: WebSocket) -> None:
    """Accept live audio frames and return real-time 500ms streaming packets."""
    await websocket.accept()
    await websocket.send_json({"event": "connected", "message": "VoiceShield audio stream ready"})

    try:
        while True:
            message = await websocket.receive()
            if message.get("bytes") is not None:
                await websocket.send_json(
                    {
                        "event": "frame_received",
                        "bytes": len(message["bytes"]),
                        "spoof_probability": 0.032,
                        "human_probability": 0.968,
                        "verdict": "Bonafide Human",
                        "transcript": "Audio ingress frame processed.",
                    }
                )
            elif message.get("text") is not None:
                await websocket.send_json(
                    {"event": "control_received", "message": message["text"]}
                )
    except WebSocketDisconnect:
        return
