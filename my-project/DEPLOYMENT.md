# VoiceShield AI — Deployment & Live Public Link Guide

This guide provides options to get a **live, shareable, deployable link** for the VoiceShield Forensic Intelligence project.

---

## ⚡ Option 1: Instant Live Public Link (Instant Demo, No Signup Required)

If you need a live HTTPS link **immediately** (for a hackathon submission or client demonstration):

### Method A — Run 1-Click Batch Script:
Double-click or run:
```cmd
my-project\share_public_link.bat
```
This automatically boots your backend + frontend and outputs a public HTTPS link:
```
your url is: https://<random-subdomain>.loca.lt
```

### Method B — Manual Localtunnel Command:
1. Ensure your frontend is running (`npm run dev` in `my-project/frontend`).
2. Run in a terminal:
```bash
npx -y localtunnel --port 5173
```
3. Share the printed `https://...loca.lt` link. 
*(Note: Localtunnel shows a simple "Click to Continue" screen on first visit to protect against abuse — anyone can click it to view your live app).*

---

## 🌐 Option 2: Deploy Frontend on Vercel (Permanent Free Cloud URL)

The frontend is already configured with [vercel.json](file:///c:/Users/rajag/Documents/voice-clone-detection/my-project/frontend/vercel.json) and builds cleanly into `dist/`.

### Quick Deploy via CLI (Takes ~60 seconds):
1. Open a terminal in `my-project/frontend`:
   ```bash
   cd my-project/frontend
   npx vercel
   ```
2. Follow the 3 prompts (login with GitHub/Email, accept default settings).
3. Vercel will build and give you a permanent public URL:
   ```
   https://voiceshield-frontend.vercel.app
   ```

### Deploy via GitHub:
1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your repository, set the **Root Directory** to `my-project/frontend`.
4. Click **Deploy**.

> **Note:** The frontend features client-side audio analysis, SNR calculation, temporal segment mapping, and fallback biomarker inference out of the box, meaning it will function as an interactive demo even before the backend is connected!

---

## ⚙️ Option 3: Deploy Backend on Render or Hugging Face Spaces

### Deploying on Render (Free Tier):
We have provided [render.yaml](file:///c:/Users/rajag/Documents/voice-clone-detection/my-project/render.yaml) and [Dockerfile](file:///c:/Users/rajag/Documents/voice-clone-detection/my-project/backend/Dockerfile).

1. Push your repository to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
3. Select your repository — Render will automatically read `render.yaml` and provision both backend and frontend.
4. Once deployed, copy your backend URL (e.g., `https://voiceshield-backend.onrender.com`).
5. In your frontend Vercel / Render settings, add the environment variable:
   - `VITE_API_BASE`: `https://voiceshield-backend.onrender.com/api`

### Deploying on Hugging Face Spaces (Recommended for AI Audio Models):
Because the backend uses `facebook/wav2vec2-xls-r-300m`, Hugging Face Spaces is a great hosting solution:
1. Create a new Space on [huggingface.co/spaces](https://huggingface.co/spaces).
2. Select **Docker** as the SDK.
3. Push the contents of `my-project/backend/` (including `Dockerfile`, `main.py`, `models/`, and `requirements.txt`).
4. Your FastAPI endpoints will be live at `https://<user>-<space-name>.hf.space`.

---

## 🔗 Connecting Deployed Frontend to Deployed Backend

In [api.ts](file:///c:/Users/rajag/Documents/voice-clone-detection/my-project/frontend/src/services/api.ts), the connection endpoint dynamically reads:
```typescript
const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8000/api'
```
When hosting online, configure `VITE_API_BASE` in your hosting dashboard with your live backend API URL.
