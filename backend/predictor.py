import pandas as pd
import numpy as np
import joblib
import os

class DenguePredictor:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.models_dir = os.path.join(self.base_dir, 'models')
        self.features = ['Rainfall_Index', 'Urban_Density', 'Case_Count']
        self.loaded = False

    def load_models(self):
        try:
            self.model_7d = joblib.load(os.path.join(self.models_dir, 'model_7d.pkl'))
            self.model_14d = joblib.load(os.path.join(self.models_dir, 'model_14d.pkl'))
            self.model_28d = joblib.load(os.path.join(self.models_dir, 'model_28d.pkl'))
            self.location_db = joblib.load(os.path.join(self.models_dir, 'location_db.pkl'))
            self.loaded = True
            print("✅ Models loaded into memory.")
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            self.loaded = False

    def _internal_predict(self, rain, density, cases):
        if not self.loaded: self.load_models()
        
        input_df = pd.DataFrame([[rain, density, cases]], columns=self.features)
        
        p1 = max(0, self.model_7d.predict(input_df)[0])
        p2 = max(0, self.model_14d.predict(input_df)[0])
        p34 = max(0, self.model_28d.predict(input_df)[0])

        # Cumulative Logic
        final_7d = int(round(p1))
        final_14d = int(round(p1 + p2))
        final_28d = int(round(p1 + p2 + p34))

        # Risk Level
        if final_28d == 0: risk = "LOW"
        elif final_28d < 5: risk = "MEDIUM"
        else: risk = "HIGH"

        return final_7d, final_14d, final_28d, risk

    def predict_by_lat_long(self, lat, long):
        """ MODE 1: Automatic Location Lookup """
        if not self.loaded: self.load_models()

        # Find nearest point in our DB
        distances = np.sqrt((self.location_db['Lat_Fine'] - lat)**2 + 
                            (self.location_db['Long_Fine'] - long)**2)
        nearest_idx = distances.idxmin()
        min_dist = distances.min()
        nearest = self.location_db.loc[nearest_idx]

        # 1km threshold (approx 0.01 degrees)
        if min_dist < 0.01:
            rain = nearest['Rainfall_Index']
            density = nearest['Urban_Density']
            cases = nearest['Case_Count']
            note = f"Data from {nearest['District']} ({min_dist*111:.2f} km away)"
        else:
            rain = 0.5
            density = 0.5
            cases = 0
            note = "Unknown location. Using generic estimates."

        p7, p14, p28, risk = self._internal_predict(rain, density, cases)

        return {
            "mode": "location",
            "analysis": note,
            "inputs": {"rain": rain, "density": density, "current_cases": int(cases)},
            "forecast": {"day_7": p7, "day_14": p14, "day_28": p28},
            "risk_level": risk
        }

    def predict_manual(self, rain, density, cases):
        """ MODE 2: Manual Simulation """
        p7, p14, p28, risk = self._internal_predict(rain, density, cases)
        
        return {
            "mode": "manual",
            "analysis": "Simulation based on user inputs.",
            "inputs": {"rain": rain, "density": density, "current_cases": cases},
            "forecast": {"day_7": p7, "day_14": p14, "day_28": p28},
            "risk_level": risk
        }

    
    def _load_risk_state(self):
        state_file = os.path.join(self.models_dir, 'risk_state.json')
        if os.path.exists(state_file):
            try:
                return joblib.load(state_file)
            except:
                return {}
        return {}

    def _save_risk_state(self, state):
        state_file = os.path.join(self.models_dir, 'risk_state.json')
        joblib.dump(state, state_file)

    def get_risk_summary(self):
        """ MODE 3: System Scan for High Risk Areas """
        if not self.loaded: self.load_models()
        
        # Load previous day's state
        risk_state = self._load_risk_state()
        new_risk_state = {}
        
        high_risk_areas = []
        
        # Iterate through all known locations in the DB
        for index, row in self.location_db.iterrows():
            rain = row['Rainfall_Index']
            density = row['Urban_Density']
            cases = row['Case_Count']
            
            # Predict for this location
            p7, p14, p28, risk = self._internal_predict(rain, density, cases)
            
            loc_id = str(row['Location_ID']) # Ensure string key
            
            if risk == "HIGH":
                # Check history
                prev_streak = risk_state.get(loc_id, {}).get('consecutive_days', 0)
                
                # REAL LOGIC: Increment streak naturally
                current_streak = prev_streak + 1
                
                new_risk_state[loc_id] = {'consecutive_days': current_streak}

                high_risk_areas.append({
                    "location_id": row['Location_ID'],
                    "district": row['District'],
                    "coordinates": f"{row['Lat_Fine']}, {row['Long_Fine']}",
                    "risk_level": risk,
                    "predicted_cases_7d": p7,
                    "predicted_cases_14d": p14,
                    "current_cases": int(cases),
                    "consecutive_days": current_streak
                })
            else:
                # Reset streak if not high risk
                new_risk_state[loc_id] = {'consecutive_days': 0}
        
        # Save new state
        self._save_risk_state(new_risk_state)
                
        return {
            "total_locations_scanned": len(self.location_db),
            "high_risk_count": len(high_risk_areas),
            "high_risk_areas": high_risk_areas
        }