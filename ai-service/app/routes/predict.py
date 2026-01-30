from fastapi import APIRouter
from app.schemas.schema import PredictionRequest, PredictionResponse
from app.utils.feature_builder import build_features
from app.services.predictor import RiskPredictor
from app.services.explain import generate_reasons

router = APIRouter()

predictor = RiskPredictor()


@router.post("/predict", response_model=PredictionResponse)
def predict_risk(payload: PredictionRequest):
    features = build_features(payload)
    predicted_class, risk_score, probabilities = predictor.predict(features)

    label_map = {0: "Low", 1: "Medium", 2: "High"}
    risk_label = label_map[predicted_class]

    reasons = generate_reasons(features, probabilities)

    return {
        "risk_score": round(float(risk_score), 2),
        "risk_label": risk_label,
        "reasons": reasons
    }
