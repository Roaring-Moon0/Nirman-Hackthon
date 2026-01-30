import { Student } from "../models/student.model.js";
import { ClassAssignment } from "../models/ClassAssignment.js";
import { Submission } from "../models/Submission.js";
import { Assignment } from "../models/Assignment.js";
import { Notes } from "../models/Notes.js";
import { Attendance } from "../models/Attendance.js";
import { Marks } from "../models/Marks.js";
import { Roadmap } from "../models/Roadmap.js";
import { SelfDeclaration } from "../models/SelfDeclaration.js";
import { generateRiskAssessment } from "../services/aiPredictionService.js";
import fs from "fs";
import { getStudentAttendanceMetrics } from "../utils/attendanceUtils.js";
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
      student.classId._id,
    );

    // Get marks metrics
    const marksMetrics = await getStudentMarksMetrics(
      student._id,
      student.classId._id,
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

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const pendingAssignments = await Assignment.find({
      classId: student.classId._id,
      isActive: true,
      _id: { $nin: submittedAssignmentIds },
      dueDate: { $gt: now },
    })
      .select("title dueDate subjectId")
      .populate("subjectId", "subjectName")
      .sort({ dueDate: 1 })
      .limit(5);

    // Deadline & workload pressure: assignments due in next 7 days
    const dueInNext7Days = await Assignment.countDocuments({
      classId: student.classId._id,
      isActive: true,
      _id: { $nin: submittedAssignmentIds },
      dueDate: { $gte: now, $lte: sevenDaysFromNow },
    });

    const workload = {
      isHighPressure: dueInNext7Days >= 3,
      message:
        dueInNext7Days >= 3
          ? `You have ${dueInNext7Days} tasks due in the next week. Planning your time can help reduce stress.`
          : dueInNext7Days > 0
            ? `${dueInNext7Days} task(s) due soon. You're doing fine.`
            : "No urgent deadlines in the next 7 days.",
    };

    // Get risk assessment from external AI service
    let riskAssessment = null;
    try {
      // Import AI service
      const { predictRisk, calculateMetricsForAI } =
        await import("../services/ai.service.js");

      // Calculate metrics for AI
      const aiMetrics = calculateMetricsForAI({
        attendanceMetrics,
        marksMetrics,
        assignmentMetrics: {
          submitted: submissions,
          total: totalAssignments,
          submissionRate:
            totalAssignments > 0 ? (submissions / totalAssignments) * 100 : 0,
        },
      });

      // Call AI service
      riskAssessment = await predictRisk(aiMetrics);
    } catch (error) {
      console.warn("AI Service Error in student dashboard:", error.message);
      // Fallback already handled in predictRisk
      riskAssessment = {
        risk_label: "Unknown",
        risk_score: null,
        reasons: ["Risk analysis temporarily unavailable"],
      };
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
        marks: {
          ...marksMetrics,
          overallAverage: marksMetrics.averagePercentage ?? 0,
        },
        assignments: {
          total: totalAssignments,
          submitted: submissions,
          pending: totalAssignments - submissions,
        },
        workload,
        risk: riskAssessment
          ? {
              level: riskAssessment.risk_label || "Unknown",
              score: riskAssessment.risk_score ?? 0,
              factors: riskAssessment.reasons || [],
            }
          : {
              level: "Unknown",
              score: 0,
              factors: ["Risk analysis temporarily unavailable"],
            },
      },
      pendingAssignments,
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
            ).toFixed(2),
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
      student.classId._id,
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

/**
 * SUBMIT ASSIGNMENT (Student Only)
 */
export const submitAssignment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { assignmentId } = req.body;

    // Validate inputs
    if (!assignmentId) {
      return res.status(400).json({ message: "Assignment ID is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Submission PDF file is required" });
    }

    const student = await Student.findOne({ userId }).populate("classId");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify assignment exists and is active
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (!assignment.isActive) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ message: "This assignment is no longer active" });
    }

    // Verify student belongs to the assignment's class
    if (student.classId._id.toString() !== assignment.classId.toString()) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({
        message: "You are not enrolled in the class for this assignment",
      });
    }

    // Check for duplicate submission
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: student._id,
    });

    if (existingSubmission) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "You have already submitted this assignment",
      });
    }

    // Check if submission is late
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;

    const submission = await Submission.create({
      assignmentId,
      studentId: student._id,
      classId: student.classId._id,
      subjectId: assignment.subjectId,
      filePath: req.file.path,
      fileName: req.file.filename,
      submissionDate: now,
      isLate,
      isGraded: false,
    });

    res.status(201).json({
      message: isLate
        ? "Assignment submitted successfully (marked as late)"
        : "Assignment submitted successfully",
      submission: {
        id: submission._id,
        fileName: submission.fileName,
        submissionDate: submission.submissionDate,
        isLate: submission.isLate,
        assignment: {
          id: assignment._id,
          title: assignment.title,
          dueDate: assignment.dueDate,
        },
      },
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }
    console.error("Error submitting assignment:", error);
    res.status(500).json({ message: "Failed to submit assignment" });
  }
};

/**
 * GET STUDENT ASSIGNMENTS (Active + Submitted Status)
 */
export const getStudentAssignments = async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await Student.findOne({ userId }).populate("classId");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get all active assignments for student's class
    const assignments = await Assignment.find({
      classId: student.classId._id,
      isActive: true,
    })
      .populate("subjectId", "subjectName")
      .populate("teacherId", "name")
      .sort({ dueDate: 1 });

    // Check submission status for each assignment
    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignmentId: assignment._id,
          studentId: student._id,
        });

        const now = new Date();
        const isPending = !submission && now < new Date(assignment.dueDate);
        const isOverdue = !submission && now >= new Date(assignment.dueDate);

        return {
          id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          subject: assignment.subjectId.subjectName,
          teacher: assignment.teacherId.name,
          dueDate: assignment.dueDate,
          fileName: assignment.fileName,
          status: submission
            ? submission.isLate
              ? "submitted_late"
              : "submitted"
            : isOverdue
              ? "overdue"
              : "pending",
          submission: submission
            ? {
                id: submission._id,
                fileName: submission.fileName,
                submittedAt: submission.submissionDate,
                isGraded: submission.isGraded,
                marks: submission.marks,
                feedback: submission.feedback,
              }
            : null,
        };
      }),
    );

    res.json({
      assignments: assignmentsWithStatus,
    });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

/**
 * GET STUDENT NOTES (For their class)
 */
export const getStudentNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subjectId } = req.query;

    const student = await Student.findOne({ userId }).populate("classId");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const query = {
      classId: student.classId._id,
      isActive: true,
    };

    if (subjectId) {
      query.subjectId = subjectId;
    }

    const notes = await Notes.find(query)
      .populate("subjectId", "subjectName")
      .populate("teacherId", "name")
      .sort({ createdAt: -1 });

    res.json({
      notes: notes.map((n) => ({
        id: n._id,
        title: n.title,
        description: n.description,
        fileName: n.fileName,
        subject: n.subjectId.subjectName,
        teacher: n.teacherId.name,
        uploadedAt: n.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

/**
 * POST /self-declare — Student voice: safe way to report struggles (no punishment)
 */
export const submitSelfDeclaration = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, message, isAnonymous } = req.body;

    if (!category || !message || !message.trim()) {
      return res.status(400).json({
        message: "Please choose a category and share what's on your mind.",
      });
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const validCategories = [
      "Academic Struggle",
      "Personal Issue",
      "Workload Pressure",
      "Other",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const declaration = await SelfDeclaration.create({
      studentId: student._id,
      category,
      message: message.trim(),
      isAnonymous: !!isAnonymous,
      status: "Pending",
    });

    res.status(201).json({
      message: "Thank you for sharing. We're here to support you.",
      id: declaration._id,
    });
  } catch (error) {
    console.error("Error submitting self-declaration:", error);
    res
      .status(500)
      .json({ message: "Unable to submit right now. Please try again." });
  }
};

/**
 * GET /roadmap — Personalized academic roadmap (action-oriented next steps)
 */
export const getStudentRoadmap = async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await Student.findOne({ userId }).populate("classId");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let roadmap = await Roadmap.findOne({ studentId: student._id });

    if (!roadmap || !roadmap.items?.length) {
      roadmap = await buildRoadmapForStudent(student);
    }

    res.json({
      items: roadmap?.items || [],
      lastGenerated: roadmap?.lastGenerated,
    });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({ message: "Failed to load your roadmap", items: [] });
  }
};

/**
 * Build or refresh roadmap from attendance, assignments, and risk
 */
async function buildRoadmapForStudent(student) {
  const items = [];
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [attendanceMetrics, riskAssessment, pendingAssignments] =
    await Promise.all([
      getStudentAttendanceMetrics(student._id, student.classId._id),
      generateRiskAssessment(student._id, student.classId._id).catch(
        () => null,
      ),
      Assignment.find({
        classId: student.classId._id,
        isActive: true,
        dueDate: { $gte: now },
      })
        .populate("subjectId", "subjectName")
        .sort({ dueDate: 1 })
        .limit(10),
    ]);

  const submittedIds = await Submission.find({
    studentId: student._id,
  }).distinct("assignmentId");
  const pending = pendingAssignments.filter(
    (a) => !submittedIds.some((id) => id.equals(a._id)),
  );

  if (
    attendanceMetrics.weightedPercentage < 75 &&
    attendanceMetrics.totalClasses > 0
  ) {
    items.push({
      title: "Improve class presence",
      type: "Attendance Boost",
      description:
        "Attending classes regularly helps stay on track. Focus on the next few sessions.",
      dueDate: null,
      isCompleted: false,
    });
  }

  if (pending.length > 0) {
    items.push({
      title: `Complete pending work (${pending.length} task${pending.length > 1 ? "s" : ""})`,
      type: "Assignment Completion",
      description:
        pending
          .slice(0, 2)
          .map((a) => a.title)
          .join(", ") + (pending.length > 2 ? " and more." : "."),
      dueDate: pending[0].dueDate,
      isCompleted: false,
    });
  }

  if (riskAssessment?.risk?.reasons?.length) {
    const subjectHint = riskAssessment.risk.reasons.find(
      (r) =>
        r.toLowerCase().includes("subject") || r.toLowerCase().includes("mark"),
    );
    if (subjectHint) {
      items.push({
        title: "Focus on weaker subjects",
        type: "Subject Focus",
        description:
          "Spend a bit more time on topics where you'd like to improve.",
        dueDate: null,
        isCompleted: false,
      });
    }
  }

  if (items.length === 0) {
    items.push({
      title: "Stay on track",
      type: "Meeting",
      description: "Keep attending classes and submitting assignments on time.",
      dueDate: null,
      isCompleted: false,
    });
  }

  let roadmap = await Roadmap.findOneAndUpdate(
    { studentId: student._id },
    { items, lastGenerated: new Date() },
    { upsert: true, new: true },
  );

  return roadmap;
}

/**
 * POST /explain-topic — Explain a lecture/topic simply (stub; AI integration later)
 */
export const explainTopicSimply = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || !String(topic).trim()) {
      return res
        .status(400)
        .json({ message: "Please enter a topic or concept." });
    }

    const t = String(topic).trim();

    // Stub: return a simple explanation and example. Replace with AI call when ready.
    const stubExplanations = {
      default: {
        explanation:
          "This topic will be explained in simple terms once the explanation service is connected. For now, we recommend revisiting your notes or asking your teacher in the next class.",
        example:
          "Example and analogies will appear here after the service is connected.",
      },
    };

    const explanation = stubExplanations[t] || stubExplanations.default;

    res.json({
      topic: t,
      explanation: explanation.explanation,
      example: explanation.example,
    });
  } catch (error) {
    console.error("Error in explain-topic:", error);
    res
      .status(500)
      .json({ message: "Explanation service is temporarily unavailable." });
  }
};

/**
 * GET STUDENT ATTENDANCE HISTORY
 */
export const getStudentAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ userId }).populate("classId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const attendanceRecords = await Attendance.find({
      studentId: student._id,
      classId: student.classId._id,
    })
      .sort({ date: -1 })
      .populate("subjectId", "subjectName")
      .populate("teacherId", "name");

    const attendanceMetrics = await getStudentAttendanceMetrics(
      student._id,
      student.classId._id,
    );

    res.json({
      metrics: attendanceMetrics,
      history: attendanceRecords.map((a) => ({
        id: a._id,
        date: a.date,
        status: a.isPresent ? "Present" : "Absent",
        subject: a.subjectId ? a.subjectId.subjectName : "General",
        teacher: a.teacherId ? a.teacherId.name : "Unknown",
      })),
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

/**
 * GET /my-teachers - Get all teachers assigned to student's class
 */
/**
 * GET /my-teachers - Get all teachers assigned to student's class
 */
export const getMyTeachers = async (req, res) => {
  try {
    const userId = req.user.userId;
    // 1. Strict Linkage: Fetch via Student -> assignedTeachers
    const student = await Student.findOne({ userId })
      .populate({
        path: "assignedTeachers",
        select: "name department email",
        populate: {
          path: "userId",
          select: "email",
        },
      })
      .populate("classId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. We also want Subject info. `assignedTeachers` is just a list of Teachers.
    // To get subjects, we might still need ClassAssignment or check which teacher teaches what in this class.
    // Let's use ClassAssignment to enrich the strict list with Subjects.
    const assignments = await ClassAssignment.find({
      classId: student.classId,
      teacherId: { $in: student.assignedTeachers.map((t) => t._id) },
    }).populate("subjectId", "subjectName subjectCode");

    // Map teacher ID to Subjects
    const teacherSubjects = {};
    assignments.forEach((a) => {
      if (!teacherSubjects[a.teacherId]) teacherSubjects[a.teacherId] = [];
      teacherSubjects[a.teacherId].push(a.subjectId);
    });

    const teachers = student.assignedTeachers.map((t) => ({
      teacherId: t._id,
      name: t.name,
      department: t.department,
      subjects: teacherSubjects[t._id] || [], // List of subjects this teacher teaches
      email: t.userId?.email || "N/A",
    }));

    res.json({ teachers });
  } catch (error) {
    console.error("Error fetching my teachers:", error);
    res.status(500).json({ message: "Failed to load teachers" });
  }
};
