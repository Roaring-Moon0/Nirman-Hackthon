import { Teacher } from "../models/teacher.model.js";
import { ClassAssignment } from "../models/ClassAssignment.js";
import { Student } from "../models/student.model.js";
import { Attendance } from "../models/Attendance.js";
import { Marks } from "../models/Marks.js";
import { Submission } from "../models/Submission.js";
import { generateRiskAssessment } from "../services/aiPredictionService.js";

export const getTeacherDashboard = async (req, res) => {
  try {
    // req.user.userId comes from JWT
    const teacher = await Teacher.findOne({ userId: req.user.userId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const assignments = await ClassAssignment.find({
      teacherId: teacher._id,
    })
      .populate("classId", "classCode year section")
      .populate("subjectId", "subjectName subjectCode semester");

    const response = assignments.map((a) => ({
      class: a.classId,
      subject: a.subjectId,
    }));

    res.json({
      teacher: {
        name: teacher.name,
        department: teacher.department,
        designation: teacher.designation,
      },
      teaching: response,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

/**
 * Get comprehensive teacher dashboard with risk summary
 */
export const getTeacherComprehensiveDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Get all classes taught by teacher
    const classAssignments = await ClassAssignment.find({
      teacherId: teacher._id,
    })
      .populate("classId")
      .populate("subjectId");

    const classData = [];

    for (const assignment of classAssignments) {
      const classId = assignment.classId._id;
      
      // Get all students in class
      const students = await Student.find({ classId });
      
      // Calculate risk for each student
      const riskSummary = {
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        students: [],
      };

      for (const student of students) {
        try {
          const riskAssessment = await generateRiskAssessment(
            student._id,
            classId
          );

          const riskLabel = riskAssessment.risk.label;
          
          if (riskLabel === "high" || riskLabel.includes("high")) {
            riskSummary.highRisk++;
            riskSummary.students.push({
              studentId: student._id,
              name: student.name,
              rollNo: student.rollNo,
              riskScore: riskAssessment.risk.score,
              reasons: riskAssessment.risk.reasons.slice(0, 3),
            });
          } else if (riskLabel === "medium" || riskLabel.includes("medium")) {
            riskSummary.mediumRisk++;
          } else {
            riskSummary.lowRisk++;
          }
        } catch (error) {
          console.warn(
            `Error calculating risk for student ${student._id}:`,
            error.message
          );
        }
      }

      classData.push({
        class: assignment.classId,
        subject: assignment.subjectId,
        totalStudents: students.length,
        riskSummary,
      });
    }

    res.json({
      teacher: {
        name: teacher.name,
        employeeId: teacher.employeeId,
        department: teacher.department,
      },
      classes: classData,
    });
  } catch (error) {
    console.error("Error fetching comprehensive dashboard:", error);
    res
      .status(500)
      .json({ message: "Failed to load comprehensive dashboard" });
  }
};

/**
 * Get high-risk students in a class
 */
export const getClassHighRiskStudents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const students = await Student.find({ classId }).populate("userId", "loginId");

    const highRiskStudents = [];

    for (const student of students) {
      try {
        const riskAssessment = await generateRiskAssessment(
          student._id,
          classId
        );

        if (
          riskAssessment.risk.label === "high" ||
          riskAssessment.risk.label.includes("high")
        ) {
          highRiskStudents.push({
            student: {
              studentId: student._id,
              name: student.name,
              rollNo: student.rollNo,
            },
            metrics: riskAssessment.metrics,
            risk: riskAssessment.risk,
          });
        }
      } catch (error) {
        console.warn(
          `Error calculating risk for student ${student._id}:`,
          error.message
        );
      }
    }

    // Sort by risk score (descending)
    highRiskStudents.sort((a, b) => {
      const scoreA = a.risk.score || 0;
      const scoreB = b.risk.score || 0;
      return scoreB - scoreA;
    });

    res.json({
      classId,
      highRiskCount: highRiskStudents.length,
      students: highRiskStudents,
    });
  } catch (error) {
    console.error("Error fetching high-risk students:", error);
    res.status(500).json({ message: "Failed to fetch high-risk students" });
  }
};

/**
 * Get student detailed analytics (for teacher)
 */
export const getStudentAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const student = await Student.findById(studentId).populate(
      "classId userId"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get attendance data
    const attendanceCount = await Attendance.countDocuments({
      studentId,
      classId: student.classId._id,
    });
    const presentCount = await Attendance.countDocuments({
      studentId,
      classId: student.classId._id,
      isPresent: true,
    });
    const attendancePercentage =
      attendanceCount > 0 ? (presentCount / attendanceCount) * 100 : 0;

    // Get latest marks
    const latestMarks = await Marks.findOne({ studentId })
      .sort({ examDate: -1 })
      .populate("subjectId", "subjectName");

    // Get submission rate
    const totalAssignments = await Submission.countDocuments({
      studentId,
    });
    const submittedAssignments = await Submission.countDocuments({
      studentId,
      filePath: { $exists: true, $ne: null },
    });
    const submissionRate =
      totalAssignments > 0 ? (submittedAssignments / totalAssignments) * 100 : 0;

    // Get risk assessment
    const riskAssessment = await generateRiskAssessment(
      studentId,
      student.classId._id
    );

    res.json({
      student: {
        name: student.name,
        rollNo: student.rollNo,
        classCode: student.classId.classCode,
      },
      analytics: {
        attendance: {
          percentage: parseFloat(attendancePercentage.toFixed(2)),
          presentClasses: presentCount,
          totalClasses: attendanceCount,
        },
        marks: latestMarks || { message: "No marks recorded" },
        assignments: {
          submitted: submittedAssignments,
          total: totalAssignments,
          submissionRate: parseFloat(submissionRate.toFixed(2)),
        },
        risk: riskAssessment,
      },
    });
  } catch (error) {
    console.error("Error fetching student analytics:", error);
    res.status(500).json({ message: "Failed to fetch student analytics" });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.userId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const classAssignments = await ClassAssignment.find({
      teacherId: teacher._id,
    })
      .populate("classId", "classCode year section department")
      .populate("subjectId", "subjectName subjectCode");

    const classes = classAssignments.map((assignment) => ({
      class: assignment.classId,
      subject: assignment.subjectId,
    }));

    res.json({
      classes,
      teacherId: teacher._id,
      teacherName: teacher.name,
    });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};

/**
 * Get students by classId for a teacher
 */
export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacher = await Teacher.findOne({ userId: req.user.userId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Verify teacher teaches this class
    const assignment = await ClassAssignment.findOne({
      teacherId: teacher._id,
      classId: classId,
    });

    if (!assignment) {
      return res
        .status(403)
        .json({ message: "You are not assigned to this class" });
    }

    const students = await Student.find({ classId }).populate(
      "userId",
      "loginId",
    );

    res.json({
      students: students.map((s) => ({
        _id: s._id,
        name: s.name,
        rollNo: s.rollNo,
        email: s.email,
      })),
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

