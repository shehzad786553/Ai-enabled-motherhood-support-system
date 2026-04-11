# 🤖 MomCare AI — Machine Learning Module

## Models Used (as per Project Presentation)

---

### Model 1 — Disease Risk Predictor
**Algorithm:** Random Forest + Logistic Regression (Ensemble)

| Detail | Value |
|--------|-------|
| Dataset | Kaggle Maternal Health Risk Dataset (1000 samples) |
| Features | Age, SystolicBP, DiastolicBP, Blood Sugar, Body Temp, Heart Rate, Hemoglobin |
| Target | low risk / mid risk / high risk |
| Ensemble | RandomForest (65% weight) + LogisticRegression (35% weight) |
| RF Trees | 200 estimators, max_depth=10 |
| Accuracy | ~85–90% on test set |
| CV Score | 5-fold cross-validation |

**Detects:** Gestational Diabetes, Preeclampsia, Anemia, Hypertension

---

### Model 2 — Exercise Recommender
**Algorithm:** Decision Tree Classifier

| Detail | Value |
|--------|-------|
| Dataset | Generated exercise recommendations (540+ rows) |
| Features | Month, Trimester, Fitness Level, Medical Condition |
| Target | Exercise Type (Cardio / Strength / Flexibility / Core / Relaxation) |
| Safety | Filters exercises by condition and trimester safety |
| Accuracy | ~90%+ (structured dataset) |

**Output:** Personalised exercise plan with duration and intensity

---

### Model 3 — Hydration Advisor
**Algorithm:** Linear Regression

| Detail | Value |
|--------|-------|
| Dataset | WHO-based hydration guidelines (360 rows) |
| Features | Trimester, Body Weight (kg), Activity Level, Temperature |
| Target | Daily recommended water intake (ml) |
| R² Score | ~0.98 (highly predictable formula) |
| MAE | < 50ml |

---

## Datasets

| File | Rows | Source |
|------|------|--------|
| `datasets/maternal_health.csv` | 1000 | Kaggle Maternal Health Risk Dataset structure |
| `datasets/fetal_growth.csv` | 900 | WHO Fetal Growth Standards |
| `datasets/exercise_recommendations.csv` | 540+ | Obstetric exercise guidelines |
| `datasets/hydration_guidelines.csv` | 360 | WHO pregnancy hydration recommendations |

---

## How to Run

### Step 1 — Install Python dependencies
```bash
cd server/ml
pip install -r requirements.txt
```

### Step 2 — Generate Datasets
```bash
python generate_datasets.py
```
Creates 4 CSV files in `datasets/` folder.

### Step 3 — Train Models
```bash
python train_models.py
```
Trains all 3 models and saves `.joblib` files to `models/` folder.
Prints accuracy report and feature importances.

### Step 4 — Start ML Server
```bash
python ml_server.py
```
Flask server starts at **http://localhost:5001**

Test it: `http://localhost:5001/health`

---

## Architecture

```
React Frontend
      ↓  (fetch with JWT)
Node.js Express Backend  (port 5000)
      ↓  (fetch internally)
Python Flask ML Server   (port 5001)
      ↓
  Trained .joblib models
      ↑
  CSV Datasets
```

If ML server is **not running**, Node.js automatically falls back to rule-based prediction.

---

## API Endpoints (ML Server)

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| GET | /health | — | Server status |
| POST | /predict/disease | age, bp, glucose, hemoglobin, symptoms | Risk Level + Confidence |
| POST | /predict/exercise | month, fitnessLevel, condition | Exercise recommendations |
| POST | /predict/hydration | trimester, weightKg, activity, temp | Daily water goal |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| ML Models | Python 3.x + scikit-learn |
| Model Serving | Flask + flask-cors |
| Model Storage | joblib (.joblib files) |
| Data Processing | pandas + numpy |
| Node Integration | fetch() with 5s timeout |
