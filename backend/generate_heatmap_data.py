import pandas as pd
import numpy as np
import joblib
import json
import os
from datetime import datetime, timedelta

# ==========================================
# CONFIGURATION
# ==========================================
MODEL_PATH = 'backend/dengue_model.pkl'
DATA_PATH = 'backend/model_training/ultimate_combined_data.csv'
OUTPUT_PATH = 'public/heatmap_data.json'

# Grid Boundaries for Kuala Lumpur (Approximate)
LAT_MIN, LAT_MAX = 3.03, 3.25
LONG_MIN, LONG_MAX = 101.60, 101.78
GRID_STEP = 0.005 # Approx 500m

TARGET_DATE = (datetime.now() + timedelta(days=7)).strftime("%d/%m/%Y") # Predict for next week

# ==========================================
# 1. LOAD MODEL & DATA
# ==========================================
print(f"Loading model from {MODEL_PATH}...")
try:
    model = joblib.load(MODEL_PATH)
    df = pd.read_csv(DATA_PATH)
    print("✅ Model and Data Loaded.")
except FileNotFoundError as e:
    print(f"❌ Error: {e}")
    exit()

# ==========================================
# 2. HELPER FUNCTIONS (Reused from train.py)
# ==========================================
known_locations = df[['Latitude', 'Longitude', 'District', 'Urban_Density']].dropna().copy()
known_locations = known_locations.drop_duplicates(subset=['Latitude', 'Longitude'])

def find_nearest_density(lat, long):
    distances = np.sqrt(
        (known_locations['Latitude'] - lat)**2 +
        (known_locations['Longitude'] - long)**2
    )
    closest_idx = distances.idxmin()
    min_dist = distances.min()
    
    if min_dist > 0.05: # If too far, assume default
        return 0.5
    return known_locations.loc[closest_idx, 'Urban_Density']

def get_rainfall_index(date_str):
    week_num = pd.to_datetime(date_str, dayfirst=True).isocalendar().week
    return 0.5 + 0.5*np.sin((week_num-10)*2*np.pi/26)

# ==========================================
# 3. GENERATE GRID POINTS
# ==========================================
print(f"Generating grid points for {TARGET_DATE}...")
heatmap_data = []

lat_range = np.arange(LAT_MIN, LAT_MAX, GRID_STEP)
long_range = np.arange(LONG_MIN, LONG_MAX, GRID_STEP)

rainfall = get_rainfall_index(TARGET_DATE)

count = 0
for lat in lat_range:
    for long in long_range:
        # 1. Get Features
        urban_density = find_nearest_density(lat, long)
        # Assume no outbreak history for general scan (conservative)
        prev_outbreak = 0 
        
        # 2. Prepare Input
        input_data = pd.DataFrame([[rainfall, urban_density, prev_outbreak]],
                                  columns=['Rainfall_Index', 'Urban_Density', 'Prev_Week_Was_Outbreak'])
        
        # 3. Predict Probability
        prob = model.predict_proba(input_data)[0][1]
        
        # 4. Filter: Only keep points with some risk to reduce file size
        if prob > 0.2: 
            heatmap_data.append({
                "lat": round(lat, 5),
                "lng": round(long, 5),
                "weight": round(prob * 10, 2) # Scale 0-1 to 0-10 for Heatmap
            })
        count += 1

# ==========================================
# 4. SAVE OUTPUT
# ==========================================
print(f"Scanned {count} points. Found {len(heatmap_data)} risk points.")
with open(OUTPUT_PATH, 'w') as f:
    json.dump(heatmap_data, f)

print(f"✅ Heatmap data saved to {OUTPUT_PATH}")
