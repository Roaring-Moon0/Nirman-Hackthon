import numpy as np


def build_features(payload):
    return np.array([[
        payload.attendance_pct,
        payload.assignment_submission_rate,
        payload.marks_trend,
        payload.absence_streak
    ]])
