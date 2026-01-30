from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    attendance_pct: float = Field(..., ge=0, le=100)
    assignment_submission_rate: float = Field(..., ge=0, le=1)
    marks_trend: float = Field(..., ge=-30, le=30)
    absence_streak: int = Field(..., ge=0, le=10)


class PredictionResponse(BaseModel):
    risk_score: float
    risk_label: str
    reasons: list[str]
