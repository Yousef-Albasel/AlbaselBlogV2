Perfect — you’re asking for a **model training pipeline checklist**:
from **raw Kepler light curve FITS/CSV → labels → preprocessing → feature extraction → model input**.

Here’s a `MODEL_TRAINING_CHECKLIST.md` you can keep in your repo. I’ll structure it step-by-step, with **data shape expectations at each stage** so you don’t get lost in matrix hell.

---

# MODEL_TRAINING_CHECKLIST.md

## Goal

Train a classifier to distinguish **planet candidates** from **false positives / non-planets** using Kepler light curves (flux over time) and labels from the Kepler Objects of Interest (KOI) catalog.

---

## Step 1. Get raw light curve data

* **Source**: Kepler light curves (FITS) from MAST / Lightkurve.
* **Content**: Each file contains `time` (BJD), `flux` (SAP or PDCSAP), flux error, quality flags.
* **Expected shape**:

  * `time`: `(N,)` → 1D array of observation times (length ≈ 30k per quarter).
  * `flux`: `(N,)` → normalized brightness at each time point.

**Example (after load):**

```python
time.shape -> (30000,)
flux.shape -> (30000,)
```

---

## Step 2. Get labels

* **Source**: NASA Exoplanet Archive KOI catalog (confirmed planets, candidates, false positives).
* **Linking**:

  * Each light curve corresponds to a **KIC ID** (Kepler Input Catalog).
  * Cross-match `kic_id` from FITS header with KOI catalog entry.
* **Expected shape**:

  * Dataframe like:

| kic_id   | koi_name | disposition    | label |
| -------- | -------- | -------------- | ----- |
| 12345678 | KOI-123  | CONFIRMED      | 1     |
| 87654321 | KOI-456  | FALSE POSITIVE | 0     |

---

## Step 3. Preprocessing light curves

### a) Cleaning

* Remove NaNs, mask out bad quality flags.
* Normalize flux (`flux / median(flux)` → centered around 1).

**Shape stays the same:**
`time (N,)`, `flux_clean (N,)`.

### b) Detrending

* Flatten long-term trends (Savitzky–Golay or `lc.flatten()` from Lightkurve).
* Removes stellar variability and instrument drift.

**Shape:**
`time (N,)`, `flux_flat (N,)`.

### c) Gap handling

* Interpolate short gaps (linear or spline).
* Large gaps: keep as missing / mark with mask.

**Shape unchanged.**

---

## Step 4. Transit search (optional for features)

* Apply **Box Least Squares (BLS)** to detect candidate period & transit parameters.
* Extract: `period`, `depth`, `duration`, `epoch`.

**Output shape:**

```json
{
  "period": float,
  "depth": float,
  "duration": float,
  "epoch": float
}
```

---

## Step 5. Feature extraction

Two options:

### A. Handcrafted statistical + astrophysical

* **Statistical features (scalar per curve)**

  * mean, std, skew, kurtosis, MAD, fraction of outliers.
* **Transit/BLS features**

  * best period, transit depth, duration, SNR, number of detected transits.
* **Frequency features**

  * top Lomb–Scargle frequencies & amplitudes.

**Expected shape:**

* One **feature vector per light curve**: `(M,)` where `M ≈ 20–200` features.
* Dataset shape: `(num_samples, M)`.

### B. Automatic feature extraction (tsfresh)

* tsfresh generates **hundreds/thousands of time-series features** automatically.
* Requires reshaping into long-form:

| id (star) | time | flux |
| --------- | ---- | ---- |
| 123       | 0.01 | 0.99 |
| 123       | 0.02 | 1.01 |
| ...       | ...  | ...  |

Then run `tsfresh.extract_features()` → `(num_samples, K)` feature matrix.

---

## Step 6. Train-test split

* Split `(X, y)` into train/test (stratified).
* Shapes:

  * `X_train: (N_train, M)`
  * `y_train: (N_train,)`
  * `X_test: (N_test, M)`
  * `y_test: (N_test,)`

---

## Step 7. Model training

* Baseline: **RandomForestClassifier / XGBoost**.
* Input: `(N, M)` features.
* Output: predicted label (0/1), probability.

**Example shapes:**

* Input to model: `(batch_size, M)`
* Output: `(batch_size,)` (predicted label)

---

## Step 8. Evaluation

* Metrics: ROC AUC, PR curve, confusion matrix.
* Expected outputs:

```json
{
  "roc_auc": 0.93,
  "precision": 0.88,
  "recall": 0.84,
  "f1": 0.86,
  "confusion_matrix": [[TN, FP], [FN, TP]]
}
```

---

## Step 9. Save artifacts

* Save feature matrix + labels (`X, y`) for reproducibility.
* Save trained model (`model.joblib`).
* Save preprocessing pipeline (`preprocess.pkl`) if needed.

---

# Quick “Shape Tracker”

* Raw light curve → `(N,) time, (N,) flux`
* After cleaning/detrending → `(N,) flux_clean`
* After features → `(M,)` feature vector per star
* Training dataset → `(num_samples, M)`
* Labels → `(num_samples,)`

---

✅ With this pipeline you can go from **raw FITS → label → feature vector → model-ready dataset**.

---

Do you want me to also write a **pseudo-code notebook pipeline** (load one FITS → preprocess → extract features → make `(X, y)`) that you can literally run on a Kepler sample tomorrow, or keep it in checklist form only?

