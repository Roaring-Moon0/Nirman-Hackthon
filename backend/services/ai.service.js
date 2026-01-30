import axios from "axios";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "https://ml-project-for-acadmic-risk.onrender.com";
const AI_TIMEOUT = 10000; // 10 seconds

/**
 * Fallback response when AI service is unavailable
 */
const FALLBACK_RESPONSE = {
  risk_label: "Unknown",
  risk_score: null,
  reasons: ["Risk analysis temporarily unavailable"],
};

/**
 * Call external AI service to predict student academic risk
 * @param {Object} metrics - Student metrics
 * @param {number} metrics.attendance_pct - Attendance percentage (0-100)
 * @param {number} metrics.assignment_submission_rate - Assignment submission rate (0-100)
 * @param {number} metrics.marks_trend - Marks trend (-100 to 100, negative = declining)
 * @param {number} metrics.absence_streak - Consecutive absences
 * @returns {Promise<Object>} Risk prediction or fallback
 */
export async function predictRisk(metrics) {
  try {
    // Validate input
    if (!metrics || typeof metrics !== "object") {
      console.warn("AI Service: Invalid metrics provided");
      return FALLBACK_RESPONSE;
    }

    // Prepare request payload
    const payload = {
      attendance_pct: metrics.attendance_pct ?? 0,
      assignment_submission_rate:
        (metrics.assignment_submission_rate ?? 0) / 100, // Convert from 0-100 to 0-1
      marks_trend: metrics.marks_trend ?? 0,
      absence_streak: metrics.absence_streak ?? 0,
    };

    console.log(
      `[AI Service] Calling ${AI_SERVICE_URL}/predict with:`,
      payload,
    );

    // Call AI service
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, payload, {
      timeout: AI_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Validate response structure
    const data = response.data;
    if (!data || !data.risk_label) {
      console.warn("AI Service: Invalid response structure", data);
      return FALLBACK_RESPONSE;
    }

    console.log("[AI Service] Success:", data);

    return {
      risk_label: data.risk_label,
      risk_score: data.risk_score ?? null,
      reasons: Array.isArray(data.reasons) ? data.reasons : [],
    };
  } catch (error) {
    // Log error but don't throw - return fallback instead
    if (error.code === "ECONNABORTED") {
      console.warn("[AI Service] Timeout after 10s");
    } else if (error.response) {
      console.warn(
        `[AI Service] HTTP ${error.response.status}:`,
        error.response.data,
      );
    } else if (error.request) {
      console.warn("[AI Service] No response received - service may be down");
    } else {
      console.warn("[AI Service] Error:", error.message);
    }

    return FALLBACK_RESPONSE;
  }
}

/**
 * Calculate metrics for AI from student data
 * @param {Object} studentData - Raw student data
 * @returns {Object} Formatted metrics for AI
 */
export function calculateMetricsForAI(studentData) {
  const {
    attendanceMetrics = {},
    marksMetrics = {},
    assignmentMetrics = {},
  } = studentData;

  return {
    attendance_pct:
      attendanceMetrics.percentage ??
      attendanceMetrics.attendancePercentage ??
      0,
    assignment_submission_rate:
      assignmentMetrics.submissionRate ??
      (assignmentMetrics.submitted && assignmentMetrics.total
        ? (assignmentMetrics.submitted / assignmentMetrics.total) * 100
        : 0),
    marks_trend: marksMetrics.trend ?? 0,
    absence_streak:
      attendanceMetrics.consecutiveAbsences ??
      attendanceMetrics.absenceStreak ??
      0,
  };
}
