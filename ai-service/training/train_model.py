import pandas as pd
import pickle

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

# Load dataset
df = pd.read_csv("student_academic_data.csv")

# Features and target
X = df[
    [
        "attendance_pct",
        "assignment_submission_rate",
        "marks_trend",
        "absence_streak",
    ]
]
y = df["risk_label"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train model
model = LogisticRegression(max_iter=1000)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("✅ Model trained successfully!")
print(f"Accuracy: {accuracy:.2f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save model
with open("../app/models/risk_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Model saved to app/models/risk_model.pkl")
