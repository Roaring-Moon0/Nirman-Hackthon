import numpy as np
import pandas as pd

# Set seed for reproducibility
np.random.seed(42)

NUM_SAMPLES = 1000

data = []

for _ in range(NUM_SAMPLES):
    attendance_pct = np.random.randint(40, 100)
    assignment_submission_rate = np.round(np.random.uniform(0.3, 1.0), 2)
    marks_trend = np.random.randint(-20, 15)
    absence_streak = np.random.randint(0, 7)

    # Risk labeling logic (teacher intuition)
    if attendance_pct < 60 or marks_trend < -10 or absence_streak >= 4:
        risk_label = 2  # High Risk
    elif attendance_pct < 75 or marks_trend < -3 or assignment_submission_rate < 0.6:
        risk_label = 1  # Medium Risk
    else:
        risk_label = 0  # Low Risk

    data.append([
        attendance_pct,
        assignment_submission_rate,
        marks_trend,
        absence_streak,
        risk_label
    ])

df = pd.DataFrame(
    data,
    columns=[
        "attendance_pct",
        "assignment_submission_rate",
        "marks_trend",
        "absence_streak",
        "risk_label"
    ]
)

# Save dataset
df.to_csv("student_academic_data.csv", index=False)


print("✅ Synthetic academic dataset generated successfully!")
print(df.head())
print("\nRisk distribution:")
print(df["risk_label"].value_counts())
