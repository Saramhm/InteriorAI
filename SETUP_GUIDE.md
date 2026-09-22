# Setup Guide

## Overview

Two parts:

| Part | What it does | Always on? |
|---|---|---|
| **Frontend** (React) | The UI users interact with | While `npm start` is running |
| **Colab/Kaggle notebook** | Runs the AI models (GPU) | No — start it manually, connect the frontend to it each session |

The frontend auto-connects via Firestore: the notebook's last cell writes `BACKEND_URL`/`CONNECTION_KEY` to a `config/colab_url` document, and the app picks it up within a few seconds of the notebook coming up. If Firestore is unreachable (or you're testing against `localhost`), connect manually instead — see step 3.

---

## 1. Start the frontend

```bash
cd frontend
npm install
npm start
```

Opens at `http://localhost:3000`. Sign in (Firebase email/password or Google) — auth still uses the shared Firebase project from the original repo.

## 2. Start the AI backend

1. Open `backend/main.ipynb` in Google Colab (or Kaggle — the notebook auto-detects the environment)
2. **Runtime → Change runtime type → T4 GPU**
3. **Runtime → Run all**
   - First run: model downloads take a few minutes
   - If you hit an install error (numpy/diffusers import errors), do **Runtime → Disconnect and delete runtime** first, not just Restart — a plain restart can leave a previous run's partially-installed packages on disk
4. The last cell prints two values once everything is up, and also writes them to Firestore for auto-connect:
   ```
   BACKEND_URL: https://xxxx.ngrok-free.app
   CONNECTION_KEY: <a long random string>
   ```

## 3. Connect the frontend to it

Usually automatic — the app is listening for the Firestore write and connects within a few seconds. If it doesn't (Firestore write failed, or you're testing locally), connect manually: click the **Connection** pill in the header → paste `BACKEND_URL` into the URL field and `CONNECTION_KEY` into the connection key field → Connect.

Every request needs that key — the notebook rejects anything without a matching `Authorization: Bearer <key>` header, so the ngrok tunnel isn't usable by anyone who doesn't have it.

## 4. (Optional) Local Flask proxy

Only needed for the Gemini/OpenAI/Replicate fallback engines — not required for the default Colab-only flow.

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in whichever API key(s) you want to use
python app.py
```

Runs at `http://localhost:5000`. The frontend won't use this automatically; it's a separate, independent backend you'd point older tooling at.

---

## Troubleshooting

**Colab crashes on `from diffusers import ControlNetModel` with a numpy or `ModuleNotFoundError`**
Leftover files from a previous session or Colab's pre-installed packages. Do a full **Disconnect and delete runtime**, not Restart, then Run all again.

**Frontend shows "Connect the API v2 notebook before editing"**
The connection check calls `/capabilities` and expects `api_version: 2`. Re-check the URL and connection key, and make sure the notebook's Flask cell actually finished running (check its output for `Backend URL: ...`).

**`npm start` fails with "npm is not recognized"**
Node.js isn't installed system-wide. Install the LTS release from [nodejs.org](https://nodejs.org), then open a new terminal.
