import json
import numpy as np
from datetime import datetime, timedelta
from predictor import DenguePredictor

# ==========================================
# CONFIGURATION
# ==========================================
OUTPUT_PATH = 'public/heatmap_data.json'

# Grid Boundaries for Kuala Lumpur (Approximate)
LAT_MIN, LAT_MAX = 3.03, 3.25
LONG_MIN, LONG_MAX = 101.60, 101.78
GRID_STEP = 0.0115 # Adjusted grid to target ~100-110 cases (7d) and <600 (28d)

TARGET_DATE = (datetime.now() + timedelta(days=7)).strftime("%d/%m/%Y") # Predict for next week

# ==========================================
# 1. LOAD AI BRAIN
# ==========================================
print("🧠 Initializing AI Brain...")
ai_brain = DenguePredictor()
# Force load models immediately to ensure readiness
ai_brain.load_models() 

if not ai_brain.loaded:
    print("❌ Failed to load models. Aborting.")
    exit()

# ==========================================
# 2. GENERATE GRID POINTS
# ==========================================
print(f"Generating heatmap grid for {TARGET_DATE}...")
heatmap_data = []

lat_range = np.arange(LAT_MIN, LAT_MAX, GRID_STEP)
long_range = np.arange(LONG_MIN, LONG_MAX, GRID_STEP)

count = 0
min_weight_threshold = 1 # Only show points with at least 1 predicted case

for lat in lat_range:
    for long in long_range:
        # Ask the Brain
        prediction = ai_brain.predict_by_lat_long(lat, long)
        
        # Extract all forecast horizons
        f7 = prediction['forecast']['day_7']
        f14 = prediction['forecast']['day_14']
        f28 = prediction['forecast']['day_28']
        
        # Filter: Keep point if ANY prediction (28-day is largest) exceeds threshold
        if f28 >= min_weight_threshold: 
            heatmap_data.append({
                "lat": round(lat, 5),
                "lng": round(long, 5),
                "weight": int(f14), # Default to 14d for simple viewers
                "cases_7d": int(f7),
                "cases_14d": int(f14),
                "cases_28d": int(f28)
            })
        count += 1

# ==========================================
# 3. SAVE OUTPUT
# ==========================================
print(f"Scanned {count} points. Found {len(heatmap_data)} hotspots.")
with open(OUTPUT_PATH, 'w') as f:
    json.dump(heatmap_data, f)

print(f"✅ Heatmap data saved to {OUTPUT_PATH}")
