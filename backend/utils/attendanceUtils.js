import { Attendance } from "../models/Attendance.js";
import { Timetable } from "../models/Timetable.js";

/**
 * Calculate attendance percentage for a student in a subject
 */
export const calculateAttendancePercentage = async (
  studentId,
  subjectId,
  classId,
) => {
  try {
    const totalRecords = await Attendance.find({
      studentId,
      subjectId,
      classId,
    }).populate("timetableId");

    if (totalRecords.length === 0) {
      return 0;
    }

    let weightedTotal = 0;
    let weightedPresent = 0;

    const weights = {
      Lecture: 1,
      Lab: 1.25,
      Practical: 1.5,
    };

    totalRecords.forEach((record) => {
      const type = record.timetableId?.classType || "Lecture";
      const weight = weights[type] || 1;
      weightedTotal += weight;
      if (record.isPresent) {
        weightedPresent += weight;
      }
    });

    return (weightedPresent / weightedTotal) * 100;
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
    const records = await Attendance.find({
      studentId,
      classId,
    }).populate("timetableId");

    if (records.length === 0) {
      return {
        totalClasses: 0,
        presentCount: 0,
        absentCount: 0,
        percentage: 0,
        weightedPercentage: 0,
        absenceStreak: 0,
      };
    }

    const weights = {
      Lecture: 1,
      Lab: 1.25,
      Practical: 1.5,
    };

    let weightedTotal = 0;
    let weightedPresent = 0;
    let presentCount = 0;

    records.forEach((record) => {
      const type = record.timetableId?.classType || "Lecture";
      const weight = weights[type] || 1;
      weightedTotal += weight;
      if (record.isPresent) {
        weightedPresent += weight;
        presentCount++;
      }
    });

    const totalClasses = records.length;
    const absentCount = totalClasses - presentCount;
    const normalPercentage = (presentCount / totalClasses) * 100;
    const weightedPercentage = (weightedPresent / weightedTotal) * 100;
    const absenceStreak = await calculateConsecutiveAbsenceStreak(studentId);

    return {
      totalClasses,
      presentCount,
      absentCount,
      percentage: parseFloat(normalPercentage.toFixed(2)),
      weightedPercentage: parseFloat(weightedPercentage.toFixed(2)),
      absenceStreak,
    };
  } catch (error) {
    console.error("Error getting attendance metrics:", error);
    throw error;
  }
};
