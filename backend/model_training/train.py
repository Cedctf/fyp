# file: model_training/train.py

import pandas as pd
import numpy as np
import joblib 
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score, f1_score

# ==========================================
# 1. LOAD DATA
# ==========================================
print("--- STEP 1: Loading Data ---")
filename = 'ultimate_combined_data.csv'

try:
    df = pd.read_csv(filename)
    print("✅ Data Loaded Successfully!")
except FileNotFoundError:
    print("❌ Error: File not found. Please make sure 'ultimate_combined_data.csv' is in this folder.")
    exit()

# ==========================================
# 2. TRAIN THE MODEL
# ==========================================
print("\n--- STEP 2: Training Model ---")
# Filter for unique Grid/Week combinations
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

model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
model.fit(X_train, y_train)
print("✅ Model Trained!")

# ==========================================
# 3. SAVE THE MODEL (Crucial for Next.js)
# ==========================================
print("\n--- STEP 3: Saving Model ---")
output_path = '../dengue_model.pkl' # Saves to your backend folder
joblib.dump(model, output_path)
print(f"✅ Model saved to: {output_path}")

# ==========================================
# 4. EVALUATE METRICS
# ==========================================
print("\n--- STEP 4: Evaluation ---")
y_pred = model.predict(X_test)

acc = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {acc*100:.2f}%")

# Note: In VS Code, we usually skip plt.show() because it blocks the terminal,
# but the calculation is done here to ensure it works.

# ==========================================
# 5. SMART LOCATION SEARCH (Your Logic)
# ==========================================
known_locations = df[['Latitude', 'Longitude', 'District', 'Urban_Density']].dropna().copy()
known_locations = known_locations.drop_duplicates(subset=['Latitude', 'Longitude'])

def find_nearest_location(lat, long):
    distances = np.sqrt(
        (known_locations['Latitude'] - lat)**2 +
        (known_locations['Longitude'] - long)**2
    )
    closest_idx = distances.idxmin()
    min_dist = distances.min()
    closest_point = known_locations.loc[closest_idx]

    if min_dist > 0.1: 
        return None, None
    return closest_point['District'], closest_point['Urban_Density']

# ==========================================
# 6. PREDICTION FUNCTION
# ==========================================
def predict_dengue_risk(lat, long, date_str, force_outbreak_history=None):
    try:
        # 1. Prepare Date & Grid
        week_num = pd.to_datetime(date_str, dayfirst=True).isocalendar().week
        grid_id = f"{round(lat, 2)}_{round(long, 2)}"

        # 2. Location Logic
        loc_data = df[df['Grid_ID'] == grid_id]

        if not loc_data.empty:
            urban_density = loc_data['Urban_Density'].iloc[0]
            valid_districts = loc_data['District'].dropna()
            location_name = valid_districts.mode()[0] if not valid_districts.empty else "Known Area"
            hist_row = loc_data[loc_data['Week'] == week_num]
            real_history = hist_row['Prev_Week_Was_Outbreak'].iloc[0] if not hist_row.empty else 0
        else:
            nearest_district, nearest_density = find_nearest_location(lat, long)
            if nearest_district:
                location_name = f"{nearest_district} (Nearby)"
                urban_density = nearest_density
                real_history = 0
            else:
                location_name = "Unknown Area"
                urban_density = 0.5
                real_history = 0

        # 3. Weather
        rainfall = 0.5 + 0.5*np.sin((week_num-10)*2*np.pi/26)

        # 4. Predict
        history_input = force_outbreak_history if force_outbreak_history is not None else real_history
        input_data = pd.DataFrame([[rainfall, urban_density, history_input]],
                                  columns=['Rainfall_Index', 'Urban_Density', 'Prev_Week_Was_Outbreak'])

        prob = model.predict_proba(input_data)[0][1]

        # 5. Risk Label
        if prob < 0.30:
            risk_label = "🟢 LOW RISK"
        elif prob < 0.70:
            risk_label = "🟡 MEDIUM RISK"
        else:
            risk_label = "🔴 HIGH RISK"

        return f"Prediction for {location_name} on {date_str}: {risk_label} ({prob*100:.1f}%)"

    except Exception as e:
        return f"Error: {e}"

# ==========================================
# 7. RUN TESTS (To verify it works)
# ==========================================
print("\n--- STEP 7: Running Tests ---")
print(predict_dengue_risk(3.21, 101.63, "29/06/2026"))
print(predict_dengue_risk(3.14, 101.70, "11/11/2025", force_outbreak_history=1))