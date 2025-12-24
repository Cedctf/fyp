import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
import joblib
import os

# CONFIG
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'ultimate_combined_data.csv')
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')

# Ensure models directory exists
os.makedirs(MODELS_DIR, exist_ok=True)

def train_and_save():
    print("⏳ Loading Data...")
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print(f"❌ Error: CSV not found at {DATA_PATH}")
        return

    # 1. Feature Engineering (Micro-Locations)
    df['Lat_Fine'] = df['Latitude'].round(3)
    df['Long_Fine'] = df['Longitude'].round(3)
    df['Location_ID'] = df['Lat_Fine'].astype(str) + "_" + df['Long_Fine'].astype(str)

    print("📊 Aggregating Data...")
    weekly = df.groupby(['Location_ID', 'Week']).agg({
        'Patient_ID': 'count',
        'Rainfall_Index': 'mean',
        'Urban_Density': 'mean',
        'Lat_Fine': 'first',
        'Long_Fine': 'first',
        'District': 'first'
    }).rename(columns={'Patient_ID': 'Case_Count'}).reset_index()
    
    weekly = weekly.sort_values(['Location_ID', 'Week'])

    # 2. Create Targets (7, 14, 28 Days)
    weekly['W1'] = weekly.groupby('Location_ID')['Case_Count'].shift(-1)
    weekly['W2'] = weekly.groupby('Location_ID')['Case_Count'].shift(-2)
    w3 = weekly.groupby('Location_ID')['Case_Count'].shift(-3)
    w4 = weekly.groupby('Location_ID')['Case_Count'].shift(-4)
    weekly['W34'] = w3.fillna(0) + w4.fillna(0)

    # 3. Save "Latest Status" Database (For Location Lookup Mode)
    # We take the most recent data point for every location to serve as our "Real World Map"
    latest_db = weekly.sort_values('Week').groupby('Location_ID').tail(1).copy()
    joblib.dump(latest_db, os.path.join(MODELS_DIR, 'location_db.pkl'))
    print("✅ Location Database Saved")

    # 4. Train Models
    train_df = weekly.dropna(subset=['W1', 'W2', 'W34'])
    features = ['Rainfall_Index', 'Urban_Density', 'Case_Count']

    print("🧠 Training AI Models...")
    
    model_7d = GradientBoostingRegressor(n_estimators=100, max_depth=3)
    model_7d.fit(train_df[features], train_df['W1'])
    joblib.dump(model_7d, os.path.join(MODELS_DIR, 'model_7d.pkl'))

    model_14d = GradientBoostingRegressor(n_estimators=100, max_depth=3)
    model_14d.fit(train_df[features], train_df['W2'])
    joblib.dump(model_14d, os.path.join(MODELS_DIR, 'model_14d.pkl'))

    model_28d = GradientBoostingRegressor(n_estimators=100, max_depth=3)
    model_28d.fit(train_df[features], train_df['W34'])
    joblib.dump(model_28d, os.path.join(MODELS_DIR, 'model_28d.pkl'))

    print("🎉 All Models Trained & Saved successfully!")

if __name__ == "__main__":
    train_and_save()