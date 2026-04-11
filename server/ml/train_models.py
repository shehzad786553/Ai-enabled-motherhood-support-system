"""
MomCare AI — Model Training Script
====================================
Trains 3 ML models as described in the project presentation:

  Model 1: Disease Risk Predictor
           → Random Forest + Logistic Regression (ensemble)
           → Input:  SystolicBP, BS, Hemoglobin, HeartRate, Age, BodyTemp
           → Output: low risk / mid risk / high risk

  Model 2: Exercise Recommender
           → Decision Tree + Rule-based filtering
           → Input:  Month, FitnessLevel, Condition
           → Output: Exercise plan list

  Model 3: Hydration Advisor
           → Linear model
           → Input:  Trimester, Weight, Activity, Temperature
           → Output: Recommended daily water (ml)

Run:
  pip install -r requirements.txt
  python generate_datasets.py     ← first
  python train_models.py          ← then this

Outputs: models/ folder with .joblib files
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble          import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model      import LogisticRegression, LinearRegression
from sklearn.tree              import DecisionTreeClassifier
from sklearn.preprocessing     import LabelEncoder, StandardScaler
from sklearn.model_selection   import train_test_split, cross_val_score
from sklearn.metrics           import classification_report, accuracy_score, confusion_matrix
from sklearn.pipeline          import Pipeline

os.makedirs("models",   exist_ok=True)
os.makedirs("datasets", exist_ok=True)

print("\n" + "="*55)
print("  🌸  MomCare AI — Model Training")
print("="*55 + "\n")

# ══════════════════════════════════════════════════════
# MODEL 1 — Disease Risk Predictor
#   Ensemble: RandomForest + LogisticRegression (VotingClassifier)
# ══════════════════════════════════════════════════════
print("📊  Training Model 1: Disease Risk Predictor")
print("-"*45)

df1 = pd.read_csv("datasets/maternal_health.csv")
print(f"   Dataset shape : {df1.shape}")
print(f"   Class balance :\n{df1['RiskLevel'].value_counts().to_string()}")

FEATURES_1 = ["Age","SystolicBP","DiastolicBP","BS","BodyTemp","HeartRate","Hemoglobin"]
X1 = df1[FEATURES_1].values
y1 = df1["RiskLevel"].values

le1 = LabelEncoder()
y1_enc = le1.fit_transform(y1)   # high risk=0, low risk=1, mid risk=2

X1_tr, X1_te, y1_tr, y1_te = train_test_split(X1, y1_enc, test_size=0.2, random_state=42, stratify=y1_enc)

# Scale
scaler1 = StandardScaler()
X1_tr_s = scaler1.fit_transform(X1_tr)
X1_te_s = scaler1.transform(X1_te)

# Model A: Random Forest
rf = RandomForestClassifier(n_estimators=200, max_depth=10, min_samples_leaf=4,
                             class_weight="balanced", random_state=42)
rf.fit(X1_tr, y1_tr)

# Model B: Logistic Regression
lr = LogisticRegression(C=1.0, class_weight="balanced", max_iter=500, random_state=42)
lr.fit(X1_tr_s, y1_tr)

# Evaluate
rf_acc = accuracy_score(y1_te, rf.predict(X1_te))
lr_acc = accuracy_score(y1_te, lr.predict(X1_te_s))
print(f"\n   RandomForest   accuracy : {rf_acc:.3f}  ({rf_acc*100:.1f}%)")
print(f"   LogisticRegr   accuracy : {lr_acc:.3f}  ({lr_acc*100:.1f}%)")
print(f"\n   RandomForest Classification Report:")
print(classification_report(y1_te, rf.predict(X1_te), target_names=le1.classes_))

# Feature importance
importances = pd.Series(rf.feature_importances_, index=FEATURES_1).sort_values(ascending=False)
print("   Feature Importances (RandomForest):")
for feat, imp in importances.items():
    bar = "█" * int(imp * 40)
    print(f"     {feat:15s} {bar}  {imp:.3f}")

# Cross-validation
cv_scores = cross_val_score(rf, X1, y1_enc, cv=5, scoring="accuracy")
print(f"\n   5-fold CV accuracy: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

# Save
joblib.dump(rf,      "models/disease_rf_model.joblib")
joblib.dump(lr,      "models/disease_lr_model.joblib")
joblib.dump(scaler1, "models/disease_scaler.joblib")
joblib.dump(le1,     "models/disease_label_encoder.joblib")
print("\n   ✅  Saved: disease_rf_model.joblib, disease_lr_model.joblib\n")


# ══════════════════════════════════════════════════════
# MODEL 2 — Exercise Recommender
#   Decision Tree to classify exercise type by profile
# ══════════════════════════════════════════════════════
print("📊  Training Model 2: Exercise Recommender")
print("-"*45)

df2 = pd.read_csv("datasets/exercise_recommendations.csv")
print(f"   Dataset shape : {df2.shape}")

FEATURES_2 = ["Month","Trimester","FitnessLevel","Condition"]
TARGET_2   = "Type"

le_fit   = LabelEncoder(); df2["FitnessLevel_enc"] = le_fit.fit_transform(df2["FitnessLevel"])
le_cond  = LabelEncoder(); df2["Condition_enc"]    = le_cond.fit_transform(df2["Condition"])
le_type  = LabelEncoder(); df2["Type_enc"]         = le_type.fit_transform(df2["Type"])
le_exname= LabelEncoder(); df2["ExName_enc"]       = le_exname.fit_transform(df2["ExerciseName"])

X2 = df2[["Month","Trimester","FitnessLevel_enc","Condition_enc"]].values
y2 = df2["Type_enc"].values

X2_tr, X2_te, y2_tr, y2_te = train_test_split(X2, y2, test_size=0.2, random_state=42)

dt = DecisionTreeClassifier(max_depth=8, min_samples_leaf=3, random_state=42)
dt.fit(X2_tr, y2_tr)
dt_acc = accuracy_score(y2_te, dt.predict(X2_te))
print(f"   DecisionTree accuracy : {dt_acc:.3f}  ({dt_acc*100:.1f}%)")

joblib.dump(dt,      "models/exercise_dt_model.joblib")
joblib.dump(le_fit,  "models/exercise_le_fitness.joblib")
joblib.dump(le_cond, "models/exercise_le_condition.joblib")
joblib.dump(le_type, "models/exercise_le_type.joblib")
# Save exercise lookup table (full dataset for recommendation retrieval)
df2.to_csv("models/exercise_lookup.csv", index=False)
print("   ✅  Saved: exercise_dt_model.joblib + exercise_lookup.csv\n")


# ══════════════════════════════════════════════════════
# MODEL 3 — Hydration Advisor (Linear Regression)
# ══════════════════════════════════════════════════════
print("📊  Training Model 3: Hydration Advisor")
print("-"*45)

df3 = pd.read_csv("datasets/hydration_guidelines.csv")
print(f"   Dataset shape : {df3.shape}")

le_act  = LabelEncoder(); df3["Activity_enc"] = le_act.fit_transform(df3["ActivityLevel"])
le_temp = LabelEncoder(); df3["Temp_enc"]     = le_temp.fit_transform(df3["Temperature"])

X3 = df3[["Trimester","WeightKg","Activity_enc","Temp_enc"]].values
y3 = df3["RecommendedMl"].values

X3_tr, X3_te, y3_tr, y3_te = train_test_split(X3, y3, test_size=0.2, random_state=42)

linreg = LinearRegression()
linreg.fit(X3_tr, y3_tr)
r2 = linreg.score(X3_te, y3_te)
from sklearn.metrics import mean_absolute_error
mae = mean_absolute_error(y3_te, linreg.predict(X3_te))
print(f"   LinearRegression  R²  : {r2:.4f}")
print(f"   Mean Absolute Error   : {mae:.1f} ml")

print("\n   Coefficients:")
for feat, coef in zip(["Trimester","WeightKg","ActivityLevel","Temperature"], linreg.coef_):
    print(f"     {feat:15s}: {coef:+.2f}")

joblib.dump(linreg,  "models/hydration_model.joblib")
joblib.dump(le_act,  "models/hydration_le_activity.joblib")
joblib.dump(le_temp, "models/hydration_le_temp.joblib")
print("\n   ✅  Saved: hydration_model.joblib\n")


# ══════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════
print("="*55)
print("  ✅  ALL MODELS TRAINED SUCCESSFULLY")
print("="*55)
print(f"""
  📁 Saved in models/ folder:
     disease_rf_model.joblib       (RandomForest)
     disease_lr_model.joblib       (LogisticRegression)
     disease_scaler.joblib         (StandardScaler)
     disease_label_encoder.joblib  (LabelEncoder)
     exercise_dt_model.joblib      (DecisionTree)
     exercise_lookup.csv           (Recommendation table)
     hydration_model.joblib        (LinearRegression)

  📊 Accuracy Summary:
     Disease Predictor (RF)  : {rf_acc*100:.1f}%
     Disease Predictor (LR)  : {lr_acc*100:.1f}%
     Exercise Recommender    : {dt_acc*100:.1f}%
     Hydration Advisor  (R²) : {r2:.4f}
""")
