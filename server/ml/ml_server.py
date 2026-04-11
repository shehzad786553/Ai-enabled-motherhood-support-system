"""
MomCare AI — Python ML Server (Flask)
=======================================
Serves 3 trained ML models as a REST API.
Called by Node.js backend for AI predictions.

Endpoints:
  GET  /health
  POST /predict/disease    → Risk Level prediction
  POST /predict/exercise   → Exercise recommendations
  POST /predict/hydration  → Daily water goal

Run: python ml_server.py
Runs on: http://localhost:5001
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ── Load models on startup ──────────────────────
MODELS = {}

def load_models():
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    try:
        MODELS["disease_rf"]    = joblib.load(f"{model_dir}/disease_rf_model.joblib")
        MODELS["disease_lr"]    = joblib.load(f"{model_dir}/disease_lr_model.joblib")
        MODELS["disease_scaler"]= joblib.load(f"{model_dir}/disease_scaler.joblib")
        MODELS["disease_le"]    = joblib.load(f"{model_dir}/disease_label_encoder.joblib")
        MODELS["exercise_dt"]   = joblib.load(f"{model_dir}/exercise_dt_model.joblib")
        MODELS["exercise_le_fit"]  = joblib.load(f"{model_dir}/exercise_le_fitness.joblib")
        MODELS["exercise_le_cond"] = joblib.load(f"{model_dir}/exercise_le_condition.joblib")
        MODELS["exercise_lookup"]  = pd.read_csv(f"{model_dir}/exercise_lookup.csv")
        MODELS["hydration"]     = joblib.load(f"{model_dir}/hydration_model.joblib")
        MODELS["hydration_le_act"]  = joblib.load(f"{model_dir}/hydration_le_activity.joblib")
        MODELS["hydration_le_temp"] = joblib.load(f"{model_dir}/hydration_le_temp.joblib")
        print("✅  All ML models loaded successfully")
    except FileNotFoundError as e:
        print(f"⚠️   Models not found: {e}")
        print("     Run: python generate_datasets.py && python train_models.py")

load_models()

# ── Helpers ─────────────────────────────────────
def safe_float(val, default=None):
    try:    return float(val) if val not in (None, "", "null") else default
    except: return default

def encode_safe(le, val, default=0):
    try:    return int(le.transform([val])[0])
    except: return default


# ══════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "running",
        "models_loaded": list(MODELS.keys()),
        "message": "🌸 MomCare AI ML Server is running"
    })


# ══════════════════════════════════════════════════
# MODEL 1 — Disease Risk Predictor
# POST /predict/disease
# Body: { age, systolicBp, diastolicBp, bloodSugar,
#         bodyTemp, heartRate, hemoglobin,
#         symptoms: [] }
# ══════════════════════════════════════════════════
@app.route("/predict/disease", methods=["POST"])
def predict_disease():
    try:
        data = request.get_json()
        week = int(data.get("pregnancyWeek", 12))

        # Extract features
        age         = safe_float(data.get("age"), 28)
        sys_bp      = safe_float(data.get("systolicBp"), 115)
        dias_bp     = safe_float(data.get("diastolicBp"), 76)
        blood_sugar = safe_float(data.get("bloodSugar"), 8.5)
        body_temp   = safe_float(data.get("bodyTemp"), 98.2)
        heart_rate  = safe_float(data.get("heartRate"), 76)
        hemoglobin  = safe_float(data.get("hemoglobin"), 11.5)
        symptoms    = data.get("symptoms", [])

        if not MODELS:
            # Fallback rule-based if models not trained yet
            return rule_based_fallback(sys_bp, blood_sugar, hemoglobin, symptoms, week)

        # Build feature vector
        X = np.array([[age, sys_bp, dias_bp, blood_sugar,
                       body_temp, heart_rate, hemoglobin]])

        # Ensemble prediction: RF + LR
        rf_pred  = MODELS["disease_rf"].predict(X)[0]
        rf_proba = MODELS["disease_rf"].predict_proba(X)[0]

        X_scaled = MODELS["disease_scaler"].transform(X)
        lr_pred  = MODELS["disease_lr"].predict(X_scaled)[0]
        lr_proba = MODELS["disease_lr"].predict_proba(X_scaled)[0]

        # Combine probabilities (weighted: RF 65%, LR 35%)
        combined_proba = 0.65 * rf_proba + 0.35 * lr_proba
        final_pred     = int(np.argmax(combined_proba))
        le             = MODELS["disease_le"]
        classes        = le.classes_
        risk_label     = classes[final_pred]

        # Map to clean label
        risk_map = {"high risk": "High", "mid risk": "Medium", "low risk": "Low"}
        risk_level = risk_map.get(risk_label, "Low")

        # Confidence
        confidence = float(np.max(combined_proba)) * 100
        proba_dict = {risk_map.get(c, c): round(float(p)*100, 1) for c, p in zip(classes, combined_proba)}

        # Generate warnings from values
        warnings = []
        if sys_bp and sys_bp > 140:
            warnings.append("Blood pressure critically elevated — risk of preeclampsia.")
        elif sys_bp and sys_bp > 130:
            warnings.append("Blood pressure above normal — monitor closely.")
        if blood_sugar and blood_sugar > 11:
            warnings.append("Blood sugar significantly elevated — gestational diabetes risk.")
        elif blood_sugar and blood_sugar > 9:
            warnings.append("Blood sugar slightly above normal range.")
        if hemoglobin and hemoglobin < 9:
            warnings.append("Severely low hemoglobin — anemia requires immediate attention.")
        elif hemoglobin and hemoglobin < 11:
            warnings.append("Low hemoglobin — anemia risk. Increase iron intake.")
        if heart_rate and heart_rate > 100:
            warnings.append("Elevated heart rate — rest more and consult doctor.")

        HIGH_RISK_SYMP = ["Vaginal bleeding","Severe abdominal pain","Blurred vision",
                          "Shortness of breath","Decreased fetal movement"]
        for s in symptoms:
            if s in HIGH_RISK_SYMP:
                warnings.append(f"{s} — requires urgent medical attention.")

        suggestions = get_suggestions(risk_level, week)

        return jsonify({
            "success":    True,
            "riskLevel":  risk_level,
            "confidence": round(confidence, 1),
            "probabilities": proba_dict,
            "model":      "RandomForest + LogisticRegression Ensemble",
            "warnings":   warnings,
            "suggestions": suggestions,
            "featureValues": {
                "age": age, "systolicBp": sys_bp, "bloodSugar": blood_sugar,
                "hemoglobin": hemoglobin, "heartRate": heart_rate
            }
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


def rule_based_fallback(sys_bp, blood_sugar, hemoglobin, symptoms, week):
    """Fallback when models not trained yet."""
    score = 0
    warnings = []
    if sys_bp and sys_bp > 140:   score += 3; warnings.append("BP critically elevated.")
    elif sys_bp and sys_bp > 130: score += 1
    if blood_sugar and blood_sugar > 11: score += 3; warnings.append("Blood sugar very high.")
    elif blood_sugar and blood_sugar > 9: score += 1
    if hemoglobin and hemoglobin < 10:  score += 2; warnings.append("Low hemoglobin — anemia risk.")
    score += len(symptoms) * 1

    risk = "High" if score >= 5 else "Medium" if score >= 2 else "Low"
    return jsonify({
        "success": True, "riskLevel": risk, "confidence": 70.0,
        "model": "Rule-Based (train models for ML accuracy)",
        "warnings": warnings, "suggestions": get_suggestions(risk, week)
    })


def get_suggestions(risk_level, week):
    tri = 1 if week <= 13 else 2 if week <= 26 else 3
    base = {
        "Low": [
            "Continue prenatal vitamins: folic acid 400mcg, iron 27mg, calcium 1000mg daily",
            f"Stay hydrated — {[2000,2300,2500][tri-1]}ml water per day for Trimester {tri}",
            "Maintain trimester-appropriate gentle exercise (20–30 min/day)",
            "Attend all scheduled prenatal checkups on time",
            "Eat iron-rich foods: spinach, lentils, pomegranate, dates",
        ],
        "Medium": [
            "Schedule a doctor appointment within 3–5 days",
            "Monitor symptoms twice daily and keep a health log",
            "Reduce salt intake and avoid processed foods",
            "Increase rest — avoid standing for long periods",
            "Boost iron with spinach, beetroot, lentils and Vitamin C",
            "Contact your doctor immediately if symptoms suddenly worsen",
        ],
        "High": [
            "⚠️  Seek medical care IMMEDIATELY — do not wait",
            "Call your doctor or go to the nearest hospital right now",
            "Do NOT self-medicate — wait for doctor's instructions",
            "Lie on your LEFT side to improve placental blood flow",
            "Use Emergency SOS in the app to notify emergency contacts",
            "Stay calm — keep breathing slowly and steadily",
        ],
    }
    return base.get(risk_level, base["Low"])


# ══════════════════════════════════════════════════
# MODEL 2 — Exercise Recommender
# POST /predict/exercise
# Body: { month, fitnessLevel, condition }
# ══════════════════════════════════════════════════
@app.route("/predict/exercise", methods=["POST"])
def predict_exercise():
    try:
        data        = request.get_json()
        month       = max(1, min(9, int(data.get("month", 1))))
        fitness     = data.get("fitnessLevel", "Beginner")
        condition   = data.get("condition", "None")
        trimester   = 1 if month <= 3 else 2 if month <= 6 else 3

        df = MODELS.get("exercise_lookup")
        if df is None:
            return jsonify({"success": False, "error": "Model not loaded"}), 500

        # Filter by month and condition
        filtered = df[df["Month"] == month].copy()
        if condition and condition != "None":
            filtered = filtered[filtered["Condition"].isin([condition, "None"])]

        # Adjust by fitness level
        if fitness == "Beginner":
            filtered = filtered[filtered["Intensity"].isin(["Light"])]
        elif fitness == "Active":
            pass  # all intensities ok

        # Top exercises
        recs = (filtered[["ExerciseName","Type","DurationMin","Intensity"]]
                .drop_duplicates("ExerciseName")
                .head(6)
                .to_dict(orient="records"))

        weekly_goal = [150, 150, 180, 180, 180, 180, 150, 150, 120][month-1]

        return jsonify({
            "success":     True,
            "month":       month,
            "trimester":   trimester,
            "fitnessLevel":fitness,
            "condition":   condition,
            "weeklyGoalMinutes": weekly_goal,
            "recommendations": recs,
            "model": "Decision Tree Classifier",
            "safetyNote": "Always warm up 5 min before and cool down 5 min after. Stop if pain, dizziness or breathlessness occurs."
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ══════════════════════════════════════════════════
# MODEL 3 — Hydration Advisor
# POST /predict/hydration
# Body: { trimester, weightKg, activityLevel, temperature }
# ══════════════════════════════════════════════════
@app.route("/predict/hydration", methods=["POST"])
def predict_hydration():
    try:
        data       = request.get_json()
        trimester  = max(1, min(3, int(data.get("trimester", 1))))
        weight     = safe_float(data.get("weightKg"), 60)
        activity   = data.get("activityLevel", "Light")
        temperature= data.get("temperature", "Moderate")

        le_act  = MODELS.get("hydration_le_act")
        le_temp = MODELS.get("hydration_le_temp")
        model   = MODELS.get("hydration")

        if not all([le_act, le_temp, model]):
            # Fallback formula
            base = {1:2000, 2:2300, 3:2500}[trimester]
            ml   = base
        else:
            act_enc  = encode_safe(le_act,  activity,    1)
            temp_enc = encode_safe(le_temp, temperature, 1)
            X = np.array([[trimester, weight, act_enc, temp_enc]])
            ml = float(model.predict(X)[0])

        ml      = max(1500, round(ml / 50) * 50)
        glasses = round(ml / 250)

        return jsonify({
            "success":        True,
            "trimester":      trimester,
            "recommendedMl":  ml,
            "glasses":        glasses,
            "model":          "Linear Regression",
            "breakdown": {
                "baseForTrimester": {1:2000, 2:2300, 3:2500}[trimester],
                "weightAdjustment": round((weight - 60) * 10),
                "activityBonus":    {"Sedentary":0,"Light":150,"Moderate":300,"Active":450}.get(activity, 0),
                "tempBonus":        {"Cool":0,"Moderate":100,"Hot":250}.get(temperature, 0),
            },
            "tips": [
                "Drink a glass of water first thing every morning",
                "Set reminders every 2 hours",
                "Increase by 250ml if exercising",
                "Eat water-rich foods: cucumber, watermelon, oranges",
                f"Target: {glasses} glasses of 250ml each today",
            ]
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    print("\n" + "="*50)
    print("  🌸  MomCare AI — ML Prediction Server")
    print("  🔗  http://localhost:5001")
    print("="*50 + "\n")
    app.run(host="0.0.0.0", port=5001, debug=False)
