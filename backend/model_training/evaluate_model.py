import pandas as pd
import numpy as np
import joblib 
import matplotlib.pyplot as plt
import seaborn as sns
import os
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ==========================================
# 0. SETUP PATHS & DIRS
# ==========================================
print("--- STEP 0: Setup ---")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '../../'))
METRICS_DIR = os.path.join(BASE_DIR, '../models_metrics') # User requested backend/models_metrics
MODELS_DIR = os.path.join(BASE_DIR, '../models')
DATA_PATH = os.path.join(BASE_DIR, 'ultimate_combined_data.csv')

if not os.path.exists(METRICS_DIR):
    os.makedirs(METRICS_DIR)
    print(f"Created metrics directory at: {METRICS_DIR}")
else:
    print(f"Metrics directory already exists: {METRICS_DIR}")

# ==========================================
# 1. LOAD DATA & PREPARE (MATCHING TRAIN.PY)
# ==========================================
print("\n--- STEP 1: Loading & Preparing Data ---")

try:
    df = pd.read_csv(DATA_PATH)
    print("✅ Data Loaded Successfully!")
except FileNotFoundError:
    print(f"❌ Error: Data file not found at {DATA_PATH}")
    exit()

# REPLICATE TRAIN.PY LOGIC EXACTLY
df['Lat_Fine'] = df['Latitude'].round(3)
df['Long_Fine'] = df['Longitude'].round(3)
df['Location_ID'] = df['Lat_Fine'].astype(str) + "_" + df['Long_Fine'].astype(str)

print("📊 Aggregating Data (Train.py Logic)...")
weekly = df.groupby(['Location_ID', 'Week']).agg({
    'Patient_ID': 'count',
    'Rainfall_Index': 'mean',
    'Urban_Density': 'mean',
    'Lat_Fine': 'first',
    'Long_Fine': 'first',
    'District': 'first'
}).rename(columns={'Patient_ID': 'Case_Count'}).reset_index()

weekly = weekly.sort_values(['Location_ID', 'Week'])

# Create Targets (7, 14, 28 Days)
weekly['W1'] = weekly.groupby('Location_ID')['Case_Count'].shift(-1)
weekly['W2'] = weekly.groupby('Location_ID')['Case_Count'].shift(-2)
w3 = weekly.groupby('Location_ID')['Case_Count'].shift(-3)
w4 = weekly.groupby('Location_ID')['Case_Count'].shift(-4)
weekly['W34'] = w3.fillna(0) + w4.fillna(0)

# Filter valid rows (same as training)
data_valid = weekly.dropna(subset=['W1', 'W2', 'W34'])

# Split Test Set
limit_week = data_valid['Week'].max() - 10
test_set = data_valid[data_valid['Week'] > limit_week].copy()

features = ['Rainfall_Index', 'Urban_Density', 'Case_Count']
print(f"Test Set Size: {len(test_set)} samples (Weeks > {limit_week})")

# ==========================================
# 2. EVALUATION FUNCTION
# ==========================================
results_text = f"DENGUE MODEL EVALUATION REPORT\n==============================\nDate: {pd.Timestamp.now()}\nTest Set: Weeks > {limit_week}\n\n"

def evaluate_horizon(model_name, target_col, duration_name):
    global results_text
    print(f"\n--- Evaluating {duration_name} Model ({model_name}) ---")
    
    path = os.path.join(MODELS_DIR, model_name)
    try:
        model = joblib.load(path)
    except FileNotFoundError:
        print(f"⚠️ Model {model_name} not found. Skipping.")
        return None

    X_test = test_set[features]
    y_test = test_set[target_col]
    y_pred = model.predict(X_test)
    
    # Validation Metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    # Tolerance Accuracy (Custom Metric)
    # We define "Accurate" if the prediction is within 1 case of the actual value.
    tolerance = 1.0 
    errors = np.abs(y_test - y_pred)
    correct_predictions = np.sum(errors <= tolerance)
    accuracy_score = (correct_predictions / len(y_test)) * 100
    
    print(f"MAE: {mae:.2f} | Accuracy (+/- {tolerance} case): {accuracy_score:.1f}%")
    
    results_text += f"[{duration_name} FORECAST]\n"
    results_text += f"Tolerance Accuracy: {accuracy_score:.2f}% (Predictions within +/- 1 case)\n"
    results_text += f"MAE:  {mae:.4f} (Avg error in case counts)\n"
    results_text += f"RMSE: {rmse:.4f}\n\n"

    # Scatter Plot (Actual vs Predicted)
    plt.figure(figsize=(6, 6))
    sns.scatterplot(x=y_test, y=y_pred, alpha=0.5)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
    plt.xlabel(f'Actual Cases ({target_col})')
    plt.ylabel(f'Predicted Cases')
    plt.title(f'{duration_name}: Actual vs Predicted (Acc: {accuracy_score:.1f}%)')
    plt.savefig(os.path.join(METRICS_DIR, f'actual_vs_pred_{duration_name}.png'))
    plt.close()

    return model

# ==========================================
# 3. RUN EVALUATIONS
# ==========================================

# Evaluate all 3 horizons
model_7d = evaluate_horizon('model_7d.pkl', 'W1', '7-Day')
model_14d = evaluate_horizon('model_14d.pkl', 'W2', '14-Day')
model_28d = evaluate_horizon('model_28d.pkl', 'W34', '28-Day')

# ==========================================
# 4. FEATURE IMPORTANCE (From 14-Day Model)
# ==========================================
print("\n--- extracting Feature Importance ---")
if model_14d:
    feature_imp = pd.Series(model_14d.feature_importances_, index=features).sort_values(ascending=False)
    
    print("Top Drivers:")
    print(feature_imp)
    
    results_text += "TOP 5 DRIVERS OF PREDICTION (14-Day Model):\n"
    results_text += feature_imp.to_string() + "\n"

    # Plot
    plt.figure(figsize=(8, 5))
    sns.barplot(x=feature_imp.values, y=feature_imp.index, palette='viridis')
    plt.title('Top Drivers of Dengue Spread (Feature Importance)')
    plt.xlabel('Impact Score')
    plt.tight_layout()
    plt.savefig(os.path.join(METRICS_DIR, 'feature_importance.png'))
    plt.close()
    print("✅ Feature Importance Plot Saved")

# ==========================================
# 5. SAVE REPORT
# ==========================================
report_path = os.path.join(METRICS_DIR, 'metrics_report.txt')
with open(report_path, 'w', encoding='utf-8') as f:
    f.write(results_text)
print(f"✅ Full Report saved to: {report_path}")
