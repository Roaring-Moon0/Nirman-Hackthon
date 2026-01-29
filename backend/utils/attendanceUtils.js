import { Attendance } from "../models/Attendance.js";

/**
 * Calculate attendance percentage for a student in a subject
 */
export const calculateAttendancePercentage = async (
  studentId,
  subjectId,
  classId
) => {
  try {
    const totalRecords = await Attendance.countDocuments({
      studentId,
      subjectId,
      classId,
    });

    if (totalRecords === 0) {
      return 0;
    }

    const presentCount = await Attendance.countDocuments({
      studentId,
      subjectId,
      classId,
      isPresent: true,
    });

    return (presentCount / totalRecords) * 100;
  } catch (error) {
    console.error("Error calculating attendance percentage:", error);
    throw error;
  }
};

/**
 * Calculate consecutive absence streak for a student
 */
export const calculateConsecutiveAbsenceStreak = async (studentId) => {
  try {
    const records = await Attendance.find({ studentId })
      .sort({ date: -1 })
      .limit(30);

    let streak = 0;
    for (const record of records) {
      if (!record.isPresent) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  } catch (error) {
    console.error("Error calculating absence streak:", error);
    throw error;
  }
};

/**
 * Get overall attendance metrics for a student
 */
export const getStudentAttendanceMetrics = async (studentId, classId) => {
  try {
    const totalClasses = await Attendance.countDocuments({
      studentId,
      classId,
    });

    const presentCount = await Attendance.countDocuments({
      studentId,
      classId,
      isPresent: true,
    });

    const absentCount = totalClasses - presentCount;
    const percentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;
    const absenceStreak = await calculateConsecutiveAbsenceStreak(studentId);

    return {
      totalClasses,
      presentCount,
      absentCount,
      percentage: parseFloat(percentage.toFixed(2)),
      absenceStreak,
    };
  } catch (error) {
    console.error("Error getting attendance metrics:", error);
    throw error;
  }
};
