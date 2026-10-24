# VoiceShield AI — Voice Clone Detection for Mobile Scams

VoiceShield AI is an end-to-end forensic intelligence platform and machine learning pipeline engineered to detect AI voice clones, deepfake audio, and synthetic speech in real-time mobile telephony and VoIP streams.

---

## 🚀 Key Features

- **Acoustic Backbone**: `facebook/wav2vec2-xls-r-300m` extracting 1024-dimensional temporal representations from Layer 7.
- **Ensemble Detection**: Soft-voting classifier combining Logistic Regression (StandardScaler + Balanced L2) and Random Forest (200 trees).
- **Temporal Localization**: 0.5-second frame-level resolution identifying exact timestamps of synthetic voice segments.
- **Biomarker Extraction**: Real-time extraction of vocal tract acoustics including pitch period jitter, amplitude shimmer (APQ), spectral flux, and phase coherence.
- **Telephony Degradation Simulation**: Integrated 8 kHz bandlimiting, G.711 $\mu$-law quantization, and phone-line noise simulation.
- **Modern Dashboard**: High-performance React 19 frontend with waveform inspection, acoustic biomarkers, live stream simulation, and forensic reporting.

---

## 📁 Repository Structure

```
voice-clone-detection/
├── models/                     # Trained classification pipelines (LR & RF)
├── my-project/
│   ├── backend/                # Production FastAPI service
│   │   ├── api/                # REST & WebSocket endpoints
│   │   ├── audio_pipeline/     # Audio preprocessing & biomarker analysis
│   │   ├── models/             # XLS-R inference & ensemble engine
│   │   ├── Dockerfile          # Production backend Docker image
│   │   └── requirements.txt
│   ├── frontend/               # React 19 + Vite + TailwindCSS Cockpit
│   │   ├── src/                # Visual components & audio analyzers
│   │   └── vercel.json         # 1-click Vercel deployment config
│   ├── render.yaml             # Render deployment blueprint
│   ├── start_hackathon.bat     # Local launcher script
│   └── share_public_link.bat   # Instant public HTTPS tunnel launcher
├── embedding.py                # XLS-R feature extraction module
├── phone_sim.py                # Telephony degradation pipeline
├── step2_xlsr.py               # Feature extraction scripts
├── step3_extract.py            # ASVspoof dataset processing
├── step4_train.py              # Model training script
├── step5_eval_extract.py       # Evaluation feature extractor
└── step6_evaluate.py           # Evaluation & EER benchmark metrics
```

---

## 🛠️ Quick Start

### 1. Backend Service
```bash
cd my-project/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Cockpit
```bash
cd my-project/frontend
npm install
npm run dev
```

Visit the dashboard at `http://localhost:5173` and the API documentation at `http://localhost:8000/docs`.

---

## 🌐 Instant Public Link
To generate an immediate, shareable public HTTPS demo link:
```cmd
my-project\share_public_link.bat
```
