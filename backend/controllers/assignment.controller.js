import { Assignment } from "../models/Assignment.js";
import { Submission } from "../models/Submission.js";
import { Notes } from "../models/Notes.js";
import { Teacher } from "../models/teacher.model.js";
import { Student } from "../models/student.model.js";
import fs from "fs";
import path from "path";

/**
 * Upload assignment PDF (teacher only)
 */
export const uploadAssignment = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { title, description, classId, subjectId, dueDate } = req.body;

    if (!title || !classId || !subjectId || !dueDate || !req.file) {
      return res
        .status(400)
        .json({ message: "Missing required fields or file" });
    }

    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const assignment = new Assignment({
      title,
      description: description || "",
      classId,
      subjectId,
      teacherId: teacher._id,
      filePath: req.file.path,
      fileName: req.file.originalname,
      dueDate: new Date(dueDate),
    });

    await assignment.save();

    res.json({
      message: "Assignment uploaded successfully",
      assignment,
    });
  } catch (error) {
    console.error("Error uploading assignment:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Failed to upload assignment" });
  }
};

/**
 * Get assignments for a class (student and teacher)
 */
export const getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const assignments = await Assignment.find({
      classId,
      isActive: true,
    })
      .populate("teacherId", "name employeeId")
      .populate("subjectId", "subjectName subjectCode")
      .sort({ dueDate: -1 });

    res.json({
      classId,
      assignmentCount: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

/**
 * Submit assignment (student only)
 */
export const submitAssignment = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { assignmentId } = req.body;

    if (!assignmentId || !req.file) {
      return res
        .status(400)
        .json({ message: "assignmentId and file are required" });
    }

    const student = await Student.findOne({ userId: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const isLate = new Date() > assignment.dueDate;

    const submission = new Submission({
      assignmentId,
      studentId: student._id,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      filePath: req.file.path,
      fileName: req.file.originalname,
      isLate,
    });

    await submission.save();

    res.json({
      message: "Assignment submitted successfully",
      submission: {
        ...submission.toObject(),
        isLate,
      },
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Failed to submit assignment" });
  }
};

/**
 * Get submissions for an assignment (teacher only)
 */
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { assignmentId } = req.query;

    if (!assignmentId) {
      return res.status(400).json({ message: "assignmentId is required" });
    }

    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Verify assignment belongs to teacher
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.teacherId.toString() !== teacher._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view these submissions" });
    }

    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "rollNo name")
      .sort({ submissionDate: -1 });

    res.json({
      assignmentId,
      assignmentTitle: assignment.title,
      submissionCount: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

/**
 * Grade submission (teacher only)
 */
export const gradeSubmission = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { submissionId, marks, feedback } = req.body;

    if (!submissionId || marks === undefined) {
      return res
        .status(400)
        .json({ message: "submissionId and marks are required" });
    }

    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.marks = marks;
    submission.feedback = feedback || "";
    submission.isGraded = true;

    await submission.save();

    res.json({
      message: "Submission graded successfully",
      submission,
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    res.status(500).json({ message: "Failed to grade submission" });
  }
};

/**
 * Get student's submission status (student only)
 */
export const getStudentSubmissions = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const student = await Student.findOne({ userId: studentId }).populate(
      "classId"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const submissions = await Submission.find({ studentId: student._id })
      .populate("assignmentId")
      .sort({ submissionDate: -1 });

    res.json({
      student: {
        rollNo: student.rollNo,
        name: student.name,
      },
      submissionCount: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

/**
 * Upload notes PDF (teacher only)
 */
export const uploadNotes = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { title, description, classId, subjectId } = req.body;

    if (!title || !classId || !subjectId || !req.file) {
      return res
        .status(400)
        .json({ message: "Missing required fields or file" });
    }

    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const notes = new Notes({
      title,
      description: description || "",
      classId,
      subjectId,
      teacherId: teacher._id,
      filePath: req.file.path,
      fileName: req.file.originalname,
    });

    await notes.save();

    res.json({
      message: "Notes uploaded successfully",
      notes,
    });
  } catch (error) {
    console.error("Error uploading notes:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Failed to upload notes" });
  }
};

/**
 * Get notes for a class (student and teacher)
 */
export const getClassNotes = async (req, res) => {
  try {
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const notes = await Notes.find({
      classId,
      isActive: true,
    })
      .populate("teacherId", "name employeeId")
      .populate("subjectId", "subjectName subjectCode")
      .sort({ createdAt: -1 });

    res.json({
      classId,
      notesCount: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

/**
 * Download file (assignment, notes, or submission)
 */
export const downloadFile = async (req, res) => {
  try {
    const { filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ message: "filePath is required" });
    }

    // Security check: prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes("..")) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const fileName = path.basename(filePath);
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Failed to download file" });
  }
};
