import { Student } from "../models/student.model.js";
import { Submission } from "../models/Submission.js";
import { Assignment } from "../models/Assignment.js";
import { Attendance } from "../models/Attendance.js";
import { Marks } from "../models/Marks.js";
import { generateRiskAssessment } from "../services/aiPredictionService.js";
import {
  getStudentAttendanceMetrics,
} from "../utils/attendanceUtils.js";
import { getStudentMarksMetrics } from "../utils/marksUtils.js";

/**
 * Get student dashboard with all relevant data
 */
export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await Student.findOne({ userId })
      .populate("classId", "classCode year section department")
      .populate("userId", "loginId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get attendance metrics
    const attendanceMetrics = await getStudentAttendanceMetrics(
      student._id,
      student.classId._id
    );

    // Get marks metrics
    const marksMetrics = await getStudentMarksMetrics(
      student._id,
      student.classId._id
    );

    // Get assignments status
    const totalAssignments = await Assignment.countDocuments({
      classId: student.classId._id,
      isActive: true,
    });

    const submissions = await Submission.countDocuments({
      studentId: student._id,
    });

    // Get pending assignments
    const submittedAssignmentIds = await Submission.find({
      studentId: student._id,
    }).distinct("assignmentId");

    const pendingAssignments = await Assignment.find({
      classId: student.classId._id,
      isActive: true,
      _id: { $nin: submittedAssignmentIds },
      dueDate: { $gt: new Date() },
    })
      .select("title dueDate subjectId")
      .populate("subjectId", "subjectName")
      .sort({ dueDate: 1 })
      .limit(5);

    // Get risk assessment from AI
    let riskAssessment = null;
    try {
      riskAssessment = await generateRiskAssessment(
        student._id,
        student.classId._id
      );
    } catch (error) {
      console.warn("Could not generate risk assessment:", error.message);
    }

    const dashboard = {
      student: {
        rollNo: student.rollNo,
        name: student.name,
        classCode: student.classId.classCode,
        year: student.classId.year,
        section: student.classId.section,
      },
      metrics: {
        attendance: attendanceMetrics,
        marks: marksMetrics,
        assignments: {
          total: totalAssignments,
          submitted: submissions,
          pending: totalAssignments - submissions,
        },
      },
      pendingAssignments,
      risk: riskAssessment || {
        riskLabel: "data_unavailable",
        reasons: ["Insufficient data for risk assessment"],
      },
    };

    res.json(dashboard);
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    res.status(500).json({ message: "Failed to load student dashboard" });
  }
};

/**
 * Get student's academic overview
 */
export const getStudentAcademicOverview = async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await Student.findOne({ userId }).populate("classId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get all marks
    const allMarks = await Marks.find({ studentId: student._id })
      .populate("subjectId", "subjectName")
      .sort({ examDate: -1 });

    // Calculate overall average
    const overallAverage =
      allMarks.length > 0
        ? parseFloat(
            (
              allMarks.reduce((sum, m) => sum + m.percentage, 0) /
              allMarks.length
            ).toFixed(2)
          )
        : 0;

    // Group by subject
    const bySubject = {};
    allMarks.forEach((mark) => {
      const subjectName = mark.subjectId.subjectName;
      if (!bySubject[subjectName]) {
        bySubject[subjectName] = [];
      }
      bySubject[subjectName].push({
        examName: mark.examName,
        percentage: mark.percentage,
        obtainedMarks: mark.obtainedMarks,
        totalMarks: mark.totalMarks,
        date: mark.examDate,
      });
    });

    res.json({
      student: {
        rollNo: student.rollNo,
        name: student.name,
      },
      overallAverage,
      bySubject,
      totalExams: allMarks.length,
    });
  } catch (error) {
    console.error("Error fetching academic overview:", error);
    res.status(500).json({ message: "Failed to fetch academic overview" });
  }
};

/**
 * Get student's risk level and reasons
 */
export const getStudentRiskLevel = async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await Student.findOne({ userId }).populate("classId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const riskAssessment = await generateRiskAssessment(
      student._id,
      student.classId._id
    );

    res.json({
      student: {
        rollNo: student.rollNo,
        name: student.name,
      },
      riskAssessment,
    });
  } catch (error) {
    console.error("Error fetching risk level:", error);
    res.status(500).json({ message: "Failed to fetch risk assessment" });
  }
};
