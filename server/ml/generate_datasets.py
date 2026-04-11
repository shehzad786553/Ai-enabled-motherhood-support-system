"""
MomCare AI — Dataset Generator
================================
Generates 3 realistic CSV datasets as used in the project:
  1. maternal_health.csv      → Disease Predictor (Kaggle-based)
  2. fetal_growth.csv         → Embryo Growth Tracker (WHO-based)
  3. exercise_recommendations.csv → Exercise Recommender

Run: python generate_datasets.py
"""

import pandas as pd
import numpy as np
import os

np.random.seed(42)
N = 1000   # samples

# ══════════════════════════════════════════════════
# DATASET 1 — Maternal Health Risk (Disease Predictor)
# Based on Kaggle Maternal Health Risk dataset structure
# Features: Age, SystolicBP, DiastolicBP, BS (blood sugar),
#           BodyTemp, HeartRate, RiskLevel
# ══════════════════════════════════════════════════
def make_maternal_health():
    ages       = np.random.randint(18, 45, N)
    sys_bp     = np.random.normal(115, 18, N).clip(70, 200).astype(int)
    dias_bp    = np.random.normal(76,  12, N).clip(50, 130).astype(int)
    blood_sugar= np.random.normal(8.5, 2.8, N).clip(4.0, 20.0).round(1)
    body_temp  = np.random.normal(98.2, 0.8, N).clip(96.0, 103.0).round(1)
    heart_rate = np.random.normal(76,  10,  N).clip(50, 120).astype(int)
    hemoglobin = np.random.normal(11.5, 1.8, N).clip(6.0, 16.0).round(1)

    # Deterministic risk labelling
    risk = []
    for i in range(N):
        score = 0
        if sys_bp[i] > 140:               score += 3
        elif sys_bp[i] > 130:             score += 1
        if blood_sugar[i] > 11:           score += 3
        elif blood_sugar[i] > 9:          score += 1
        if hemoglobin[i] < 9:             score += 3
        elif hemoglobin[i] < 11:          score += 1
        if heart_rate[i] > 100:           score += 1
        if body_temp[i] > 100.4:          score += 2
        if ages[i] > 40 or ages[i] < 20:  score += 1

        if score >= 5:    risk.append("high risk")
        elif score >= 2:  risk.append("mid risk")
        else:             risk.append("low risk")

    df = pd.DataFrame({
        "Age":           ages,
        "SystolicBP":    sys_bp,
        "DiastolicBP":   dias_bp,
        "BS":            blood_sugar,
        "BodyTemp":      body_temp,
        "HeartRate":     heart_rate,
        "Hemoglobin":    hemoglobin,
        "RiskLevel":     risk,
    })
    df.to_csv("datasets/maternal_health.csv", index=False)
    print(f"✅  maternal_health.csv  — {len(df)} rows")
    print(df["RiskLevel"].value_counts().to_string(), "\n")


# ══════════════════════════════════════════════════
# DATASET 2 — Fetal Growth (WHO obstetric standards)
# Features: Week, BiparietalDiameter_mm, FemoralLength_mm,
#           AbdominalCirc_mm, EstimatedWeight_g, HeadCirc_mm
# ══════════════════════════════════════════════════
def make_fetal_growth():
    WHO = {
        # week: (BPD_mm, FL_mm, AC_mm, HC_mm, weight_g)
         5: (5,   3,   15,  25,   1),
         6: (8,   4,   20,  40,   2),
         7: (11,  6,   30,  55,   4),
         8: (14,  8,   45,  70,   8),
         9: (18, 11,   58,  88,  14),
        10: (22, 14,   72, 107,  29),
        11: (27, 17,   87, 130,  45),
        12: (32, 21,  105, 155,  58),
        13: (37, 24,  120, 178,  73),
        14: (43, 28,  140, 205,  93),
        15: (49, 32,  158, 230, 117),
        16: (55, 36,  175, 254, 146),
        17: (61, 40,  196, 278, 181),
        18: (67, 44,  215, 302, 222),
        19: (72, 48,  233, 325, 270),
        20: (78, 52,  252, 348, 324),
        21: (84, 56,  270, 371, 385),
        22: (89, 60,  289, 393, 453),
        23: (95, 64,  308, 415, 530),
        24: (100,68,  325, 436, 614),
        25: (106,71,  343, 457, 707),
        26: (111,75,  361, 477, 809),
        27: (116,78,  378, 497, 922),
        28: (121,82,  395, 516,1045),
        29: (126,85,  412, 534,1180),
        30: (131,88,  428, 552,1325),
        31: (135,91,  444, 569,1481),
        32: (140,94,  460, 586,1648),
        33: (144,97,  475, 602,1825),
        34: (148,99,  490, 618,2011),
        35: (152,102, 505, 633,2204),
        36: (155,104, 519, 647,2402),
        37: (158,106, 532, 661,2602),
        38: (161,108, 545, 674,2801),
        39: (163,110, 557, 686,2996),
        40: (165,112, 568, 697,3186),
    }
    rows = []
    for week, (bpd, fl, ac, hc, wt) in WHO.items():
        for _ in range(25):   # 25 samples per week = 900 rows
            rows.append({
                "Week":                  week,
                "BiparietalDiameter_mm": int(np.random.normal(bpd, bpd*0.05)),
                "FemoralLength_mm":      int(np.random.normal(fl,  fl*0.05)),
                "AbdominalCirc_mm":      int(np.random.normal(ac,  ac*0.04)),
                "HeadCirc_mm":           int(np.random.normal(hc,  hc*0.04)),
                "EstimatedWeight_g":     int(np.random.normal(wt,  wt*0.06)),
                "Trimester":             1 if week<=13 else 2 if week<=26 else 3,
            })
    df = pd.DataFrame(rows)
    df.to_csv("datasets/fetal_growth.csv", index=False)
    print(f"✅  fetal_growth.csv     — {len(df)} rows\n")


# ══════════════════════════════════════════════════
# DATASET 3 — Exercise Recommendations
# Features: Month, FitnessLevel, Condition,
#           ExerciseName, Type, DurationMin, Intensity, Safe
# ══════════════════════════════════════════════════
def make_exercise_data():
    EXERCISES = [
        # (name, type, base_duration, intensity, safe_months)
        ("Gentle Walking",         "Cardio",    20, "Light",    range(1,10)),
        ("Prenatal Yoga",          "Flexibility",30,"Light",    range(1,10)),
        ("Swimming",               "Cardio",    25, "Moderate", range(1,8)),
        ("Water Aerobics",         "Cardio",    30, "Moderate", range(2,8)),
        ("Stationary Cycling",     "Cardio",    20, "Moderate", range(1,8)),
        ("Pelvic Floor Exercises", "Strength",  15, "Light",    range(1,10)),
        ("Prenatal Pilates",       "Core",      30, "Moderate", range(2,7)),
        ("Stretching",             "Flexibility",20,"Light",    range(1,10)),
        ("Cat-Cow Stretch",        "Flexibility",15,"Light",    range(1,10)),
        ("Wall Push-ups",          "Strength",  15, "Light",    range(1,8)),
        ("Squats (no weight)",     "Strength",  15, "Moderate", range(1,7)),
        ("Side-lying Leg Raises",  "Strength",  15, "Light",    range(4,10)),
        ("Butterfly Pose",         "Flexibility",15,"Light",    range(1,10)),
        ("Deep Breathing",         "Relaxation",10, "Light",    range(1,10)),
        ("Brisk Walking",          "Cardio",    30, "Moderate", range(1,7)),
    ]
    CONDITIONS = ["None","Diabetes","Hypertension","Back Pain","Anemia"]
    FITNESS    = ["Beginner","Intermediate","Active"]

    rows = []
    for month in range(1, 10):
        for fit in FITNESS:
            for cond in CONDITIONS:
                safe_exs = [(n,t,d,i) for (n,t,d,i,sm) in EXERCISES if month in sm]
                # Filter by condition
                if cond == "Hypertension":
                    safe_exs = [(n,t,d,i) for n,t,d,i in safe_exs if i != "High"]
                if cond == "Back Pain":
                    safe_exs = [(n,t,d,i) for n,t,d,i in safe_exs if t in ("Flexibility","Relaxation")]
                for name,etype,dur,intensity in safe_exs[:5]:
                    dur_adj = dur - (month-1)*1 if month > 6 else dur   # reduce in 3rd tri
                    rows.append({
                        "Month":        month,
                        "Trimester":    1 if month<=3 else 2 if month<=6 else 3,
                        "FitnessLevel": fit,
                        "Condition":    cond,
                        "ExerciseName": name,
                        "Type":         etype,
                        "DurationMin":  max(10, dur_adj),
                        "Intensity":    intensity,
                    })

    df = pd.DataFrame(rows)
    df.to_csv("datasets/exercise_recommendations.csv", index=False)
    print(f"✅  exercise_recommendations.csv — {len(df)} rows\n")


# ══════════════════════════════════════════════════
# DATASET 4 — Hydration Guidelines
# Features: Trimester, WeightKg, ActivityLevel, SeasonTemp,
#           RecommendedMl, Glasses
# ══════════════════════════════════════════════════
def make_hydration_data():
    rows = []
    for tri in [1, 2, 3]:
        for weight in range(45, 101, 5):
            for activity in ["Sedentary","Light","Moderate","Active"]:
                for temp in ["Cool","Moderate","Hot"]:
                    base = 1800 + (tri-1)*200
                    base += {"Sedentary":0,"Light":150,"Moderate":300,"Active":450}[activity]
                    base += {"Cool":0,"Moderate":100,"Hot":250}[temp]
                    base += (weight - 60) * 10
                    ml = max(1500, round(base / 50) * 50)
                    rows.append({
                        "Trimester":     tri,
                        "WeightKg":      weight,
                        "ActivityLevel": activity,
                        "Temperature":   temp,
                        "RecommendedMl": ml,
                        "Glasses":       round(ml / 250),
                    })
    df = pd.DataFrame(rows)
    df.to_csv("datasets/hydration_guidelines.csv", index=False)
    print(f"✅  hydration_guidelines.csv — {len(df)} rows\n")


if __name__ == "__main__":
    os.makedirs("datasets", exist_ok=True)
    print("\n🔄  Generating MomCare AI Datasets...\n" + "="*45)
    make_maternal_health()
    make_fetal_growth()
    make_exercise_data()
    make_hydration_data()
    print("="*45)
    print("✅  All 4 datasets saved to /datasets/\n")
