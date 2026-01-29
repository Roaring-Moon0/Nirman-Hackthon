import { Marks } from "../models/Marks.js";

/**
 * Calculate marks trend for a student in a subject
 * Returns: "improving" | "declining" | "stable" | "insufficient_data"
 */
export const calculateMarksTrend = async (studentId, subjectId) => {
  try {
    const marks = await Marks.find({
      studentId,
      subjectId,
    })
      .sort({ examDate: 1 })
      .limit(10);

    if (marks.length < 2) {
      return "insufficient_data";
    }

    const recent = marks.slice(-3);
    if (recent.length < 2) {
      return "insufficient_data";
    }

    const avgRecent = recent.reduce((sum, m) => sum + m.percentage, 0) / recent.length;
    const older = marks.slice(0, Math.max(1, marks.length - 3));
    const avgOlder = older.reduce((sum, m) => sum + m.percentage, 0) / older.length;

    const difference = avgRecent - avgOlder;
    const threshold = 5; // 5% threshold for change

    if (difference > threshold) {
      return "improving";
    } else if (difference < -threshold) {
      return "declining";
    } else {
      return "stable";
    }
  } catch (error) {
    console.error("Error calculating marks trend:", error);
    throw error;
  }
};

/**
 * Get overall marks metrics for a student
 */
export const getStudentMarksMetrics = async (studentId, classId) => {
  try {
    const marks = await Marks.find({ studentId }).sort({ examDate: -1 });

    if (marks.length === 0) {
      return {
        latestMarks: null,
        averagePercentage: 0,
        trend: "insufficient_data",
        totalExams: 0,
      };
    }

    const latestMarks = marks[0];
    const averagePercentage = parseFloat(
      (marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length).toFixed(2)
    );

    return {
      latestMarks: {
        examName: latestMarks.examName,
        obtainedMarks: latestMarks.obtainedMarks,
        totalMarks: latestMarks.totalMarks,
        percentage: latestMarks.percentage,
        examDate: latestMarks.examDate,
      },
      averagePercentage,
      trend: await calculateMarksTrend(studentId, marks[0].subjectId),
      totalExams: marks.length,
    };
  } catch (error) {
    console.error("Error getting marks metrics:", error);
    throw error;
  }
};

/**
 * Get marks by subject for a student
 */
export const getMarksBySubject = async (studentId) => {
  try {
    const marksBySubject = await Marks.aggregate([
      { $match: { studentId } },
      {
        $group: {
          _id: "$subjectId",
          averagePercentage: { $avg: "$percentage" },
          latestPercentage: { $last: "$percentage" },
          totalExams: { $sum: 1 },
          examName: { $last: "$examName" },
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "_id",
          as: "subject",
        },
      },
    ]);

    return marksBySubject;
  } catch (error) {
    console.error("Error getting marks by subject:", error);
    throw error;
  }
};
