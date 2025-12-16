from flask import Flask, request, jsonify
from flask_cors import CORS
from predictor import DenguePredictor

app = Flask(__name__)
CORS(app) # Allow Next.js to call this API

# Initialize Predictor
ai_brain = DenguePredictor()
ai_brain.load_models()

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "Dengue AI Online", "models_loaded": ai_brain.loaded})

@app.route('/predict/location', methods=['POST'])
def predict_location():
    data = request.json
    lat = float(data.get('latitude'))
    long = float(data.get('longitude'))
    
    result = ai_brain.predict_by_lat_long(lat, long)
    return jsonify(result)

@app.route('/predict/manual', methods=['POST'])
def predict_manual():
    data = request.json
    rain = float(data.get('rainfall'))
    density = float(data.get('urban_density'))
    cases = float(data.get('current_cases'))
    
    result = ai_brain.predict_manual(rain, density, cases)
    return jsonify(result)

@app.route('/api/alerts/status', methods=['GET'])
def get_alert_status():
    """ Endpoint for Admin Dashboard to get current high-risk areas """
    summary = ai_brain.get_risk_summary()
    return jsonify(summary)

if __name__ == '__main__':
    app.run(port=5000, debug=True)