
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, precision_score, recall_score, f1_score
import pickle
import os

# ==========================================
# STEP 2: LOAD DATA
# ==========================================
# Use absolute path or relative to file location for robustness
current_dir = os.path.dirname(os.path.abspath(__file__))
filename = os.path.join(current_dir, 'ultimate_combined_data.csv')

try:
    df = pd.read_csv(filename)
    print("✅ Data Loaded Successfully!")
except FileNotFoundError:
    print(f"❌ Error: File not found: {filename}")
    exit(1)

# ==========================================
# STEP 3: TRAIN THE MODEL
# ==========================================
# Filter for unique Grid/Week combinations to avoid duplicate training rows
train_df = df.drop_duplicates(subset=['Grid_ID', 'Week']).copy()

features = ['Rainfall_Index', 'Urban_Density', 'Prev_Week_Was_Outbreak']
target = 'Target_Case_Next_Week'

# Split into Train (Weeks 1-40) and Test (Weeks 41-52)
train_set = train_df[train_df['Week'] <= 40]
test_set = train_df[train_df['Week'] > 40]

X_train = train_set[features]
y_train = train_set[target]
X_test = test_set[features]
y_test = test_set[target]

print("Training Model... Please wait.")
model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
model.fit(X_train, y_train)
print("✅ Model Trained!")

# ==========================================
# SAVE THE MODEL
# ==========================================
# Saving to backend/dengue_model.pkl (parent directory of this script)
model_save_path = os.path.join(current_dir, '..', 'dengue_model.pkl')
try:
    with open(model_save_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"✅ Model Saved to {model_save_path}")
except Exception as e:
    print(f"❌ Error saving model: {e}")

# ==========================================
# STEP 4: EVALUATE & VISUALIZE METRICS
# ==========================================
y_pred = model.predict(X_test)

# Setup the Plot
plt.figure(figsize=(14, 6))

# A. Confusion Matrix
plt.subplot(1, 2, 1)
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False, annot_kws={"size": 16})
plt.title('Confusion Matrix\n(Did we catch the outbreaks?)', fontsize=14)
plt.xlabel('Predicted Label', fontsize=12)
plt.ylabel('Actual Label', fontsize=12)
plt.xticks([0.5, 1.5], ['Safe (0)', 'Outbreak (1)'])
plt.yticks([0.5, 1.5], ['Safe (0)', 'Outbreak (1)'])

# B. Performance Metrics Bar Chart
acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred)
rec = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

metrics = [acc, prec, rec, f1]
metric_names = ['Accuracy', 'Precision', 'Recall', 'F1-Score']

plt.subplot(1, 2, 2)
bars = sns.barplot(x=metric_names, y=metrics, palette='viridis')
plt.ylim(0, 1.1)
plt.title(f'Model Performance Metrics (Accuracy: {acc*100:.1f}%)', fontsize=14)
plt.ylabel('Score (0.0 - 1.0)', fontsize=12)

# Add numbers on top of bars
for i, v in enumerate(metrics):
    plt.text(i, v + 0.02, f"{v:.2f}", ha='center', fontweight='bold', fontsize=12)

plt.tight_layout()
# plt.show() # Commented out to avoid blocking if run in non-interactive env

# ==========================================
# STEP 5: PREPARE SMART LOCATION SEARCH
# ==========================================
# Create a reference table of all known Lat/Longs and their Districts
known_locations = df[['Latitude', 'Longitude', 'District', 'Urban_Density']].dropna().copy()
known_locations = known_locations.drop_duplicates(subset=['Latitude', 'Longitude'])

def find_nearest_location(lat, long):
    """
    Finds the closest known district to the user's input.
    """
    distances = np.sqrt(
        (known_locations['Latitude'] - lat)**2 +
        (known_locations['Longitude'] - long)**2
    )

    closest_idx = distances.idxmin()
    min_dist = distances.min()
    closest_point = known_locations.loc[closest_idx]

    if min_dist > 0.1: # 11km threshold
        return None, None

    return closest_point['District'], closest_point['Urban_Density']

# ==========================================
# STEP 6: THE FINAL PREDICTION APP FUNCTION
# ==========================================
def predict_dengue_risk(lat, long, date_str, force_outbreak_history=None):
    try:
        # 1. Prepare Date & Grid
        week_num = pd.to_datetime(date_str, dayfirst=True).isocalendar().week
        grid_id = f"{round(lat, 2)}_{round(long, 2)}"

        # 2. SMART LOCATION SEARCH
        loc_data = df[df['Grid_ID'] == grid_id]

        if not loc_data.empty:
            # Exact Match Found!
            urban_density = loc_data['Urban_Density'].iloc[0]
            valid_districts = loc_data['District'].dropna()
            location_name = valid_districts.mode()[0] if not valid_districts.empty else "Known Area"

            # History
            hist_row = loc_data[loc_data['Week'] == week_num]
            real_history = hist_row['Prev_Week_Was_Outbreak'].iloc[0] if not hist_row.empty else 0

        else:
            # Nearest Neighbor Search
            nearest_district, nearest_density = find_nearest_location(lat, long)

            if nearest_district:
                location_name = f"{nearest_district} (Nearby)"
                urban_density = nearest_density
                real_history = 0
            else:
                location_name = "Unknown Area (Outside KL)"
                urban_density = 0.5
                real_history = 0

        # 3. Weather Calculation
        rainfall = 0.5 + 0.5*np.sin((week_num-10)*2*np.pi/26)

        # 4. Predict
        history_input = force_outbreak_history if force_outbreak_history is not None else real_history
        input_data = pd.DataFrame([[rainfall, urban_density, history_input]],
                                  columns=['Rainfall_Index', 'Urban_Density', 'Prev_Week_Was_Outbreak'])

        prob = model.predict_proba(input_data)[0][1]

        # 5. Determine 3-Level Risk Label
        if prob < 0.30:
            risk_label = "🟢 LOW RISK"
            est_cases = 0
            advice = "Conditions are safe."
        elif prob < 0.70:
            risk_label = "🟡 MEDIUM RISK"
            est_cases = 1
            advice = "Be careful. Mosquitoes are active."
        else:
            risk_label = "🔴 HIGH RISK"
            est_cases = 1
            advice = "High Danger! Active outbreak likely."

        return {
            "District": location_name,
            "Latitude": lat,   # <--- ADDED
            "Longitude": long, # <--- ADDED
            "Date": date_str,
            "Risk Prediction": risk_label,
            "Probability": f"{prob*100:.1f}%",
            "Estimated Cases": est_cases,
            "Advice": advice,
            "Factors": f"Rain: {rainfall:.2f}, Density: {urban_density:.2f}, History: {history_input}"
        }

    except Exception as e:
        return f"Error: {e}"

# ==========================================
# STEP 7: TEST IT
# ==========================================
if __name__ == "__main__":
    print("\n--- TEST 1: Your High Density Area (Kepong) ---")
    print(predict_dengue_risk(3.21, 101.63, "29/06/2026"))

    print("\n--- TEST 2: Simulate Outbreak History (Bukit Bintang Nearby) ---")
    print(predict_dengue_risk(3.14, 101.70, "11/11/2025", force_outbreak_history=1))
