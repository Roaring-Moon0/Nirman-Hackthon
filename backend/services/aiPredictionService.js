import axios from "axios";
import { Attendance } from "../models/Attendance.js";
import { Marks } from "../models/Marks.js";
import { Submission } from "../models/Submission.js";
import { calculateMarksTrend } from "../utils/marksUtils.js";

/**
 * Aggregate academic metrics required for AI risk prediction
 */
export const aggregateStudentRiskData = async (studentId, classId) => {
  try {
    /* -------------------- ATTENDANCE % -------------------- */
    const totalAttendance = await Attendance.countDocuments({
      studentId,
      classId,
    });

    let attendancePercentage = 0;

    if (totalAttendance > 0) {
      const presentCount = await Attendance.countDocuments({
        studentId,
        classId,
        isPresent: true,
      });

      attendancePercentage = (presentCount / totalAttendance) * 100;
    }

    /* -------------------- ABSENCE STREAK -------------------- */
    const recentAttendance = await Attendance.find({
      studentId,
      classId,
    })
      .sort({ date: -1 })
      .limit(30);

    let absenceStreak = 0;
    for (const record of recentAttendance) {
      if (!record.isPresent) {
        absenceStreak++;
      } else {
        break;
      }
    }

    /* -------------------- ASSIGNMENT SUBMISSION RATE (0–1) -------------------- */
    const totalAssignments = await Submission.countDocuments({
      studentId,
    });

    const submittedAssignments = await Submission.countDocuments({
      studentId,
      filePath: { $exists: true, $ne: null },
    });

    const assignmentSubmissionRate =
      totalAssignments > 0
        ? submittedAssignments / totalAssignments
        : 0;

    /* -------------------- MARKS TREND (NUMERIC) -------------------- */
    let marksTrend = 0;

    const latestMarks = await Marks.findOne({
      studentId,
    }).sort({ examDate: -1 });

    if (latestMarks) {
      const trendValue = await calculateMarksTrend(
        studentId,
        latestMarks.subjectId
      );

      // Ensure numeric value only
      if (typeof trendValue === "number" && !isNaN(trendValue)) {
        marksTrend = trendValue;
      }
    }

    return {
      attendancePercentage: Number(attendancePercentage.toFixed(2)),
      absenceStreak,
      assignmentSubmissionRate: Number(
        assignmentSubmissionRate.toFixed(2)
      ),
      marksTrend,
    };
  } catch (error) {
    console.error("Error aggregating student risk data:", error);
    throw error;
  }
};

/**
 * Call external AI risk prediction service
 */
export const getPredictionFromAI = async (riskMetrics) => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL;

    if (!aiServiceUrl) {
      throw new Error("AI_SERVICE_URL not configured");
    }

    // AI expects ONLY these fields
    const aiPayload = {
      attendance_pct: riskMetrics.attendancePercentage,
      assignment_submission_rate: riskMetrics.assignmentSubmissionRate,
      marks_trend: riskMetrics.marksTrend,
      absence_streak: riskMetrics.absenceStreak,
    };

    const response = await axios.post(
      `${aiServiceUrl}/predict`,
      aiPayload,
      { timeout: 15000 }
    );

    return {
      riskScore: response.data.risk_score,
      riskLabel: response.data.risk_label,
      reasons: response.data.reasons || [],
    };
  } catch (error) {
    console.error("AI service error:", error.message);

    // Safe fallback (important for demo stability)
    return {
      riskScore: null,
      riskLabel: "service_unavailable",
      reasons: ["AI service temporarily unavailable"],
    };
  }
};

/**
 * Generate complete risk assessment for dashboards
 */
export const generateRiskAssessment = async (studentId, classId) => {
  try {
    const metrics = await aggregateStudentRiskData(studentId, classId);
    const aiResult = await getPredictionFromAI(metrics);

    return {
      studentId,
      classId,
      metrics: {
        attendancePercentage: metrics.attendancePercentage,
        absenceStreak: metrics.absenceStreak,
        assignmentSubmissionRate: metrics.assignmentSubmissionRate,
        marksTrend: metrics.marksTrend,
      },
      risk: {
        score: aiResult.riskScore,
        label: aiResult.riskLabel,
        reasons: aiResult.reasons,
      },
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error generating risk assessment:", error);
    throw error;
  }
};
