import pickle
import numpy as np
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "risk_model.pkl"


class RiskPredictor:
    def __init__(self):
        with open(MODEL_PATH, "rb") as f:
            self.model = pickle.load(f)

    def predict(self, features: np.ndarray):
        probabilities = self.model.predict_proba(features)[0]
        predicted_class = probabilities.argmax()
        risk_score = probabilities[predicted_class]

        return predicted_class, risk_score, probabilities
