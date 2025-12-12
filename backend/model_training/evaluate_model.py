import pandas as pd
import numpy as np
import joblib 
import matplotlib.pyplot as plt
import seaborn as sns
import os
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, f1_score, precision_score, recall_score

# ==========================================
# 0. SETUP PATHS & DIRS
# ==========================================
print("--- STEP 0: Setup ---")
METRICS_DIR = '../metrics'
if not os.path.exists(METRICS_DIR):
    os.makedirs(METRICS_DIR)
    print(f"Created metrics directory at: {METRICS_DIR}")
else:
    print(f"Metrics directory already exists: {METRICS_DIR}")

# ==========================================
# 1. LOAD DATA & MODEL
# ==========================================
print("\n--- STEP 1: Loading Data & Model ---")
filename = 'ultimate_combined_data.csv'
model_path = '../dengue_model.pkl'

try:
    df = pd.read_csv(filename)
    print("✅ Data Loaded Successfully!")
except FileNotFoundError:
    print("❌ Error: Data file not found.")
    exit()

try:
    model = joblib.load(model_path)
    print("✅ Model Loaded Successfully!")
except FileNotFoundError:
    print("❌ Error: Model file not found. Please train the model first.")
    exit()

# ==========================================
# 2. PREPARE TEST DATA
# ==========================================
print("\n--- STEP 2: Preparing Test Data ---")
# Filter and split same as training
train_df = df.drop_duplicates(subset=['Grid_ID', 'Week']).copy()

features = ['Rainfall_Index', 'Urban_Density', 'Prev_Week_Was_Outbreak']
target = 'Target_Case_Next_Week'

# Test set (Weeks 41-52)
test_set = train_df[train_df['Week'] > 40]

X_test = test_set[features]
y_test = test_set[target]

print(f"Test Set Size: {len(X_test)} samples")

# ==========================================
# 3. CALCULATE METRICS
# ==========================================
print("\n--- STEP 3: Calculating Metrics ---")
y_pred = model.predict(X_test)

acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

metrics_text = f"""DENGUE MODEL EVALUATION REPORT
==============================
Date Generated: {pd.Timestamp.now()}

accuracy:  {acc:.4f}
precision: {prec:.4f}
recall:    {rec:.4f}
f1_score:  {f1:.4f}

CONFUSION MATRIX:
{confusion_matrix(y_test, y_pred)}

CLASSIFICATION REPORT:
{classification_report(y_test, y_pred, zero_division=0)}
"""

print(metrics_text)

# Save Text Report
report_path = os.path.join(METRICS_DIR, 'metrics_report.txt')
with open(report_path, 'w', encoding='utf-8') as f:
    f.write(metrics_text)
print(f"✅ Text report saved to: {report_path}")

# ==========================================
# 4. GENERATE PLOTS
# ==========================================
print("\n--- STEP 4: Generating Plots ---")

# 4.1 Confusion Matrix Plot
plt.figure(figsize=(8, 6))
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
plt.xlabel('Predicted Label')
plt.ylabel('True Label')
plt.title('Confusion Matrix')
cm_path = os.path.join(METRICS_DIR, 'confusion_matrix.png')
plt.savefig(cm_path)
plt.close()
print(f"✅ Confusion Matrix plot saved to: {cm_path}")

# 4.2 Feature Importance Plot (if applicable)
try:
    if hasattr(model, 'feature_importances_'):
        plt.figure(figsize=(10, 6))
        feat_importances = pd.Series(model.feature_importances_, index=features)
        feat_importances.nlargest(10).plot(kind='barh')
        plt.title('Feature Importance')
        plt.xlabel('Importance Score')
        feat_path = os.path.join(METRICS_DIR, 'feature_importance.png')
        plt.savefig(feat_path)
        plt.close()
        print(f"✅ Feature Importance plot saved to: {feat_path}")
    else:
        print("ℹ️ Model does not support feature importance plotting.")
except Exception as e:
    print(f"⚠️ Could not generate feature importance plot: {e}")

print("\n--- EVALUATION COMPLETE ---")
