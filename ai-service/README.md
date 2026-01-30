# Academic Risk AI Service

This repository contains the AI/ML microservice for the **Academic Risk & Engagement Analytics System**.

The service predicts early academic risk for students using attendance and performance data and exposes predictions through a FastAPI REST API.

---

## 🔍 What This Service Does

- Uses a trained supervised machine learning model
- Predicts student academic risk (Low / Medium / High)
- Provides explainable reasons for each prediction
- Designed as a decision-support tool for educators

---

## 🧠 AI Approach

**Model:** Logistic Regression (scikit-learn)  
**Training Data:** Synthetic academic data (privacy-safe)

### Features Used
- Attendance percentage
- Assignment submission rate
- Marks trend
- Consecutive absence count

The model is trained offline and loaded only for predictions.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
pip install -r requirements.txt
```

### Running the Service

```bash
uvicorn app.main:app --reload --port 8000
```

Access Swagger UI at: http://localhost:8000/docs

---

## 📡 API Endpoint

### POST `/predict`

**Request:**
```json
{
    "attendance_pct": 65,
    "assignment_submission_rate": 0.5,
    "marks_trend": -8,
    "absence_streak": 3
}
```

**Response:**
```json
{
    "risk_score": 0.95,
    "risk_label": "High",
    "reasons": [
        "Low attendance in recent weeks",
        "Poor assignment submission rate",
        "Declining academic performance",
        "Multiple consecutive absences"
    ]
}
```

---

## 📁 Project Structure

```
.
├── app/
│   ├── main.py          # FastAPI application
│   ├── model.py         # Model inference logic
│   └── schemas.py       # Request/response models
├── models/              # Trained model files
├── requirements.txt     # Dependencies
└── README.md            # This file
```

---

## 🔧 Development

For local development, install dev dependencies and run tests as needed.

---

## 📝 License

Refer to the main repository for license information.

