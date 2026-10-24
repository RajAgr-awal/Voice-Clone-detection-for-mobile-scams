# VoiceShield AI — Forensic Intelligence Backend

Production FastAPI service for real-time voice anti-spoofing, deepfake detection, and scam forensics.

## Linked Machine Learning Pipeline

- **Acoustic Backbone**: `facebook/wav2vec2-xls-r-300m`
  - 1024-dimensional hidden representations extracted from Layer 7 with sequence pooling.
  - Accelerated via CUDA half-precision (`float16`) on NVIDIA GeForce RTX GPU.
- **Classifiers**:
  - `Logistic Regression`: StandardScaler pipeline trained on ASVspoof 2019 (Dev Accuracy: 99.996%, ROC-AUC: 1.000).
  - `Random Forest`: 200 trees, max depth 20 (Dev Accuracy: 99.589%, ROC-AUC: 0.99996).
  - `Forensic Ensemble`: Soft-voting average (0.6 LR + 0.4 RF).
- **Temporal Localization (Phase 2)**:
  - 0.5-second temporal window resolution across intermediate XLS-R frame representations.
- **Biomarker Extraction**:
  - Real pitch period jitter (%), amplitude shimmer APQ (%), spectral flux, phase coherence, and glottal continuity.
- **Telephony Degradation (Phase 2)**:
  - On-the-fly 8 kHz bandlimiting, G.711 mu-law quantization, and phone line simulation.

## Checkpoint Locations

- `backend/models/checkpoints/logistic_regression.joblib`
- `backend/models/checkpoints/random_forest.joblib`

## Running Locally

```cmd
cd my-project/backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Useful Endpoints

- `GET /health`: Lightweight heartbeat
- `GET /api/status`: Active model metadata, device (`cuda`/`cpu`), and telemetry
- `POST /api/analyze`: Comprehensive forensic audio analysis (WAV, FLAC, MP3, WEBM)
- `POST /api/stream/chunk`: Real-time 500ms streaming chunk inference
- `GET /api/benchmarks`: Evaluation metrics (Clean EER, telephony EER multiplier, ROC curve)
- `WS /ws/stream`: WebRTC / WebSocket streaming audio socket
