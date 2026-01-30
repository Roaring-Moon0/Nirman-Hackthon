FEATURE_REASONS = {
    0: "Low attendance in recent weeks",
    1: "Poor assignment submission rate",
    2: "Declining academic performance",
    3: "Multiple consecutive absences"
}


def generate_reasons(features, probabilities):
    reasons = []

    # Simple human-readable explanations
    if features[0][0] < 70:
        reasons.append(FEATURE_REASONS[0])
    if features[0][1] < 0.6:
        reasons.append(FEATURE_REASONS[1])
    if features[0][2] < -5:
        reasons.append(FEATURE_REASONS[2])
    if features[0][3] >= 3:
        reasons.append(FEATURE_REASONS[3])

    return reasons or ["Overall performance trend indicates moderate risk"]
