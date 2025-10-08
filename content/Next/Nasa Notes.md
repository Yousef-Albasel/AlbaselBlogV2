---
title: "Notes for Nasa"
date: "2025-10-02"
category: ""
description: ""
---

# Nasa Competition Notes and Checklist

# Orbitify — README & Implementation Checklist

> Sources: Next.js install & app router docs, Kepler public light curves, Lightkurve, Astropy BLS/Lomb-Scargle, FastAPI, tsfresh, and your project brief. ([Next.js][1]) 

---

## Table of contents

* [Goal / Scope](#goal--scope)
* [Prerequisites](#prerequisites)
* [Quick start — create frontend & backend](#quick-start---create-frontend--backend)
* [Recommended repo layout / folder structure](#recommended-repo-layout--folder-structure)
* [Frontend (Next.js) — routes, components, tips](#frontend-nextjs---routes-components-tips)
* [Backend (FastAPI) — endpoints & skeletons](#backend-fastapi---endpoints--skeletons)
* [Data → Kepler & labels (how to get them)](#data--kepler--labels-how-to-get-them)
* [Preprocessing & feature extraction checklist](#preprocessing--feature-extraction-checklist)
* [Modeling & evaluation checklist](#modeling--evaluation-checklist)
* [Integration & deployment notes (dev flow)](#integration--deployment-notes-dev-flow)
* [Final checklist (tick boxes)](#final-checklist-tick-boxes)

---

# Goal / Scope

Build an interactive web app where users can:

1. See **insights** and interactive visualizations about exoplanet datasets (public page).
2. **Upload** their own Kepler light curves (FITS or CSV) and get immediate preprocessing, feature extraction, and model inference.
3. Explore **public** curated analysis of Kepler datasets (cool visualizations / precomputed results).

We'll use **Next.js** for the UI (App Router recommended) and a **FastAPI** Python service for ML preprocessing / inference / retraining. Next.js docs recommend Node.js 18.18+ for App Router. ([Next.js][1])

---

# Prerequisites

* Node.js 18.18+ & npm (Next.js App Router requirement). ([Next.js][1])
* Python 3.10+ (recommended) with `venv`.
* Tools: Git, Docker (optional but recommended), VSCode (or your favorite torture device).
* Python packages (installed later): `fastapi`, `uvicorn`, `lightkurve`, `astropy`, `numpy`, `pandas`, `scikit-learn`, `tsfresh` (or optional feature libraries), `joblib`.
* Data sources: Kepler Public Light Curves (MAST) and NASA Exoplanet Archive for labels. ([MAST][2])

---

# Quick start — create frontend & backend

### Frontend (Next.js)

```bash
# create Next app (choose TypeScript, App Router, Tailwind if asked)
npx create-next-app@latest orbitify-frontend
cd orbitify-frontend

# dev server
npm run dev
```

`create-next-app` will prompt options (TypeScript? App Router? Tailwind?). Use App Router (recommended). System reqs & steps: Next.js docs. ([Next.js][1])

Install front-end libs (examples):

```bash
npm install axios @tanstack/react-query react-dropzone react-plotly.js plotly.js
# optional: tailwindcss, clsx, zustand, react-hook-form
```

### Backend (FastAPI)

```bash
# create backend folder
mkdir ../orbitify-backend && cd ../orbitify-backend
python -m venv venv
source venv/bin/activate      # or venv\Scripts\activate on Windows

pip install "fastapi[all]" uvicorn lightkurve astropy numpy pandas scikit-learn tsfresh joblib
```

FastAPI quickstart & docs: see FastAPI tutorial. ([FastAPI][3])

Run dev server:

```bash
uvicorn app.main:app --reload --port 8000
```

---

# Recommended repo layout / folder structure

```
orbitify/                       # monorepo root (recommended)
├─ frontend/                    # Next.js app
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx               # Home
│  │  ├─ upload/page.tsx        # Upload & analysis UI
│  │  ├─ public/page.tsx        # Public analysis & dashboards
│  │  ├─ api/                   # (optional) Next route handlers
│  ├─ components/
│  │  ├─ Header.tsx
│  │  ├─ LightCurveViewer.tsx   # interactive Plotly viewer
│  │  ├─ UploadForm.tsx
│  │  ├─ AnalysisCard.tsx
│  ├─ lib/
│  │  ├─ apiClient.ts           # axios wrapper, react-query hooks
│  ├─ styles/
│  ├─ public/
│  └─ package.json
├─ backend/
│  ├─ app/
│  │  ├─ main.py                # FastAPI app
│  │  ├─ routers/
│  │  │  ├─ upload.py
│  │  │  ├─ predict.py
│  │  │  ├─ features.py
│  │  ├─ services/              # code for preprocessing, features, models
│  │  ├─ models/                # saved model artifacts (.joblib / .pkl)
│  ├─ requirements.txt
│  ├─ Dockerfile
│  └─ docker-compose.yml
├─ data/                        # small curated samples ( DO NOT commit large raw files)
└─ README.md
```

---

# Frontend (Next.js) — routes, components, tips

### Routes

Use the **App Router** with these pages:

* `/` — Home: highlights, KPIs, example discoveries, live metrics.
* `/upload` — Upload interface: upload FITS/CSV, options (detrend params), preview, trigger preprocessing & predict.
* `/public` — Public analysis: curated dashboards, interactive charts, downloadable CSVs.

### Components

* **LightCurveViewer**: interactive time-series (Plotly) with zoom, hover, mark transit windows.
* **UploadForm**: drag & drop (react-dropzone), file type checker (`.fits`, `.csv`), progress indicator.
* **AnalysisCard**: result summary (probability, predicted period, depth, transit windows).
* **Header / Footer**: quick links + "Run analysis" CTA.

### Client ↔ Server flow

* Put API base URL in `.env.local` as `NEXT_PUBLIC_API_URL=http://localhost:8000`.
* Use `axios` or `fetch` + `@tanstack/react-query` for uploads / polling jobs.
* Upload pattern (recommended): `POST /api/upload` as `multipart/form-data` (file + metadata). Backend returns job id and quick preview; Next polls `GET /api/jobs/{job_id}` until done.

**Example client upload (fetch):**

```js
const form = new FormData();
form.append('file', file);
form.append('source', 'kepler');

await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
  method: 'POST',
  body: form
});
```

---

# Backend (FastAPI) — endpoints & skeletons

### Minimal endpoints (suggested)

* `POST /upload` — Accepts file (FITS or CSV). Saves file, returns `job_id`, preview stats (length, nan_frac).
* `GET /jobs/{job_id}` — Poll job status + results (features, charts endpoint references).
* `POST /predict` — Accept JSON with `light_curve` (time[], flux[]) or `file_id` → returns `{label, probability, period, depth, duration, transit_windows}`.
* `GET /public/analyses` — Precomputed public analyses (for `/public` page).
* `POST /retrain` — Admin-only retrain trigger (optional — asynchronous job).
* `GET /model/metrics` — Current model metrics (ROC AUC, precision/recall) for dashboard.

### Example `main.py` skeleton

```py
from fastapi import FastAPI, UploadFile, File
app = FastAPI(title="Orbitify API")

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    # save file, enqueue job (or process sync for demo)
    return {"job_id": "abc123", "status": "processing"}

@app.post("/predict")
def predict(payload: dict):
    # payload might contain time[], flux[] OR file_id
    return {"label":"candidate", "prob":0.87, "period":3.24}
```

**Tip:** For production or heavier models use `uvicorn`/`gunicorn` + workers or a background task queue (Redis + RQ/Celery). FastAPI docs for background tasks are excellent. ([FastAPI][3])

---

# Data — Kepler & labels (how to get them)

* Kepler full light curve archive: MAST Kepler public lightcurves (directory layout & raw FITS files). Use this for bulk downloads and sample FITS. ([MAST][2])
* Labels: use NASA Exoplanet Archive (KOI tables / confirmed vs false positive) to map target IDs to labels for supervised learning. Cross-match by KIC / KOI IDs. ([exoplanetarchive.ipac.caltech.edu][4])

**Download tips**

* For a demo, **don't** download all Kepler files. Pick sample KIC IDs or test quarters and keep a small curated folder under `data/samples/`. Use Lightkurve to fetch specific targets programmatically. ([lightkurve.github.io][5])

---

# Preprocessing & feature extraction checklist

This is the practical pipeline to implement in `backend/app/services/preprocess.py`.

1. **Load** file:

   * FITS → use `lightkurve` to read PDCSAP flux (`.PDCSAP_FLUX` is usually the recommended corrected flux). For raw files, Lightkurve is the easiest entry point. ([lightkurve.github.io][5])
2. **Basic cleaning**

   * Remove NaNs, drop huge gaps, sigma-clipping for outliers (`astropy.stats.sigma_clip` or `numpy` logic).
3. **Detrend / Flatten**

   * Use `lightkurve.LightCurve.flatten()` (built-in) or a Savitzky–Golay filter (`scipy.signal.savgol_filter`) to remove long-term trends. ([SciPy Documentation][6])
4. **Gap handling / interpolation**

   * Interpolate small gaps; flag larger gaps.
5. **Period search**

   * Run **Box Least Squares (BLS)** to find candidate transit periods & durations. Astropy provides a `BoxLeastSquares` implementation — use that to compute candidate periods and transit windows. ([docs.astropy.org][7])
6. **Feature extraction**

   * **Statistical**: mean, median, std, skewness, kurtosis, median absolute deviation, max, min, percentiles, number of NaNs, fraction of outliers.
   * **Transit-specific** (from BLS results): best period, transit depth, duration, SNR, number of transits, phase-folded skew/shape metrics.
   * **Frequency-domain**: Lomb-Scargle periodogram peaks (for stellar variability). ([docs.astropy.org][8])
   * **Auto features**: Optionally run `tsfresh` to compute a broad set of features automatically and then perform feature selection. ([tsfresh.readthedocs.io][9])

**Pseudo-code (very short):**

```py
import lightkurve as lk
lcfile = lk.search_lightcurvefile(target_id).download()
lc = lcfile.PDCSAP_FLUX.remove_nans().normalize()
lc_flat = lc.flatten(window_length=401) # tuned per star
time, flux = lc_flat.time.value, lc_flat.flux

# BLS
from astropy.timeseries import BoxLeastSquares
bls = BoxLeastSquares(time, flux)
result = bls.autopower(0.2)  # duration guess
best_period = result.period[np.argmax(result.power)]
```

**Notes:**

* Use **PDCSAP** flux where possible — it's corrected for common systematics; Lightkurve helps with this. ([lightkurve.github.io][5])
* BLS is the de-facto transit detection algorithm and is available in `astropy.timeseries`. ([docs.astropy.org][7])

---

# Modeling & evaluation checklist

* **Baselines**: RandomForest / XGBoost on engineered features (fast to iterate).
* **Strong baseline**: Astronet-like CNN on *folded* and *global/local* views (see Shallue & Vanderburg deep learning work as reference). ([arXiv][10])
* Techniques to consider:

  * Class balancing (SMOTE, class weights)
  * Stratified K-fold (time-aware folds if needed)
  * Threshold tuning per precision/recall tradeoff
* **Metrics**: Precision, Recall, F1, ROC-AUC, and confusion matrix on an *unseen* holdout set.

---

# Integration & deployment notes (dev flow)

* **Local dev**:

  * FastAPI on `localhost:8000`, Next.js on `localhost:3000`. Use `NEXT_PUBLIC_API_URL` env var in Next to point to backend.
  * For simpler local CORS / proxying, add `next.config.js` rewrites so `/api/*` proxies to backend in development.
* **Dockerize** both services and run via `docker-compose` with ports `3000` (frontend) and `8000` (backend).
* **Model artifacts**: save model files in `backend/models/model.joblib`. Use `joblib` for scikit-learn models.
* **Security**: for the challenge demo, you can skip auth, but note: allowlist uploads & file-size limits; implement a sane quota.

---

# Example: API contract (JSON schemas — copy into docs)

**POST /upload** (`multipart/form-data`)

* Request: `file` (FITS or CSV), `source` (string), `meta` (json optional)
* Response:

```json
{
  "job_id": "string",
  "status": "queued|processing|done|failed",
  "preview": {"n_points": 1234, "nan_frac": 0.02}
}
```

**POST /predict** (JSON)

* Request:

```json
{
  "time": [..],
  "flux": [..],
  "meta": {"kic": "12345"}
}
```

* Response:

```json
{
  "label": "planet_candidate",
  "probability": 0.92,
  "period": 3.24,
  "depth": 0.0012,
  "duration": 0.12,
  "transit_windows": [[2455000.2, 2455000.32], ...]
}
```

---

# Final checklist (tick boxes)

Use this list during the hack — follow top-to-bottom.

### Project setup

* [ ] Create repo `orbitify` (monorepo layout above) and push initial commit.
* [ ] Add `README.md` (this file) and issue templates for tasks.

### Frontend (Next)

* [ ] `npx create-next-app` → choose TypeScript, App Router, Tailwind. ([Next.js][1])
* [ ] Implement `/` Home skeleton + global layout.
* [ ] Implement `/upload` page + `UploadForm` component (drag & drop).
* [ ] Implement `LightCurveViewer` with Plotly (preview + overlay transit windows).
* [ ] Integrate `react-query` for uploads & job polling.
* [ ] Implement `/public` page that fetches `/public/analyses`.

### Backend (FastAPI)

* [ ] Init FastAPI app skeleton + health route. ([FastAPI][3])
* [ ] Implement `POST /upload` (save file, quick preview metadata).
* [ ] Implement preprocessing pipeline (Lightkurve → cleaning → flatten). ([lightkurve.github.io][5])
* [ ] Implement `POST /predict` using baseline model (RandomForest).
* [ ] Add `GET /jobs/{id}` to poll processing status.

### Data & preprocessing

* [ ] Download a small sample (MAST Kepler quick targets). ([MAST][2])
* [ ] Implement BLS-based period search (astropy BoxLeastSquares). ([docs.astropy.org][7])
* [ ] Implement feature set: mean, std, skew, kurtosis, BLS depth/duration, Lomb-Scargle peak. ([docs.astropy.org][8])
* [ ] (Optional) run `tsfresh` to extract large feature set for model exploration. ([tsfresh.readthedocs.io][9])

### Modeling

* [ ] Train baseline RandomForest/XGBoost on features.
* [ ] Evaluate using stratified CV; compute ROC AUC, precision/recall.
* [ ] (Optional) implement Astronet-style CNN baseline (paper reference). ([arXiv][10])

### Integration / Demo

* [ ] Wire frontend to backend for upload → preview → predict flow.
* [ ] Add sample demo button: "Analyze sample Kepler lightcurve" (use preloaded sample).
* [ ] Prepare short demo script (3–4 slides + live demo).

### Deploy (if time)

* [ ] Dockerize backend + frontend, add `docker-compose.yml`.
* [ ] Deploy frontend to Vercel & backend to a Cloud VM / Render / Railway (if allowed).

---

# Quick troubleshooting / gotchas

* **FITS files**: many fields — use Lightkurve to avoid hand-parsing. ([lightkurve.github.io][5])
* **PDCSAP vs SAP flux**: PDCSAP is pre-corrected for systematics — generally preferred. ([lightkurve.github.io][5])
* **BLS tuning**: duration guesses (in days) critically affect detection; try `autopower()` ranges. ([docs.astropy.org][7])

---

# References (short)

* Next.js App Router & install. ([Next.js][1])
* FastAPI tutorial (endpoints / docs). ([FastAPI][3])
* Kepler public light curves (MAST). ([MAST][2])
* Lightkurve — friendly Kepler/TESS library. ([lightkurve.github.io][5])
* Astropy `BoxLeastSquares` & Lomb-Scargle. ([docs.astropy.org][7])
* tsfresh (automatic time-series feature extraction). ([tsfresh.readthedocs.io][9])
* Astronet (Shallue & Vanderburg) — deep-learning baseline. ([arXiv][10])
* Your project brief — *The Space Decoders* (uploaded). 

---

Alright — this README is battle-ready. For the challenge tomorrow: get the upload → predict demo working locally with one or two sample Kepler light curves (PDCSAP) and a simple RandomForest baseline that returns a probability and a plotted transit window. That demo looks impressive and is robust under time pressure.

Want me to also produce:

* (A) Minimal FastAPI `main.py` + BLS preprocessing snippet you can copy-paste?
* (B) A simple Next.js `/upload` page with `react-dropzone` and fetch logic?

Say which one and I’ll spit it out now — no waiting, no fluff.

[1]: https://nextjs.org/docs/app/getting-started/installation "Getting Started: Installation | Next.js"
[2]: https://archive.stsci.edu/kepler/publiclightcurves.html?utm_source=chatgpt.com "MAST Kepler Public Light Curves"
[3]: https://fastapi.tiangolo.com/tutorial/first-steps/?utm_source=chatgpt.com "First Steps"
[4]: https://exoplanetarchive.ipac.caltech.edu/?utm_source=chatgpt.com "NASA Exoplanet Archive"
[5]: https://lightkurve.github.io/lightkurve/?utm_source=chatgpt.com "Lightkurve docs"
[6]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.savgol_filter.html?utm_source=chatgpt.com "savgol_filter — SciPy v1.16.2 Manual"
[7]: https://docs.astropy.org/en/stable/timeseries/bls.html?utm_source=chatgpt.com "Box Least Squares (BLS) Periodogram"
[8]: https://docs.astropy.org/en/latest/timeseries/lombscargle.html?utm_source=chatgpt.com "Lomb-Scargle Periodograms"
[9]: https://tsfresh.readthedocs.io/en/latest/api/tsfresh.feature_extraction.html?utm_source=chatgpt.com "tsfresh.feature_extraction package - Read the Docs"
[10]: https://arxiv.org/abs/1712.05044?utm_source=chatgpt.com "Identifying Exoplanets with Deep Learning: A Five Planet Resonant Chain around Kepler-80 and an Eighth Planet around Kepler-90"


Medical References:
1. None — DOI: file_000000003ffc6246ab7ea13b6b639725


