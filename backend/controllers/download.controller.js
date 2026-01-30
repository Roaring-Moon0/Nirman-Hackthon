import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Assignment } from "../models/Assignment.js";
import { Submission } from "../models/Submission.js";
import { Notes } from "../models/Notes.js";
import fs from "fs";
import path from "path";

/**
 */
export const downloadAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Authorization check
    if (userRole === "student") {
      const student = await Student.findOne({ userId });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Student must be in the assignment's class
      if (student.classId.toString() !== assignment.classId.toString()) {
        return res.status(403).json({
          message: "You do not have permission to access this assignment",
        });
      }
    } else if (userRole === "teacher") {
      const teacher = await Teacher.findOne({ userId });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      // Teacher must be the creator
      if (teacher._id.toString() !== assignment.teacherId.toString()) {
        return res.status(403).json({
          message: "You do not have permission to access this assignment",
        });
      }
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    // Security: Prevent directory traversal
    const filePath = path.resolve(assignment.filePath);
    const uploadsDir = path.resolve("./uploads");

    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({ message: "Invalid file path" });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Stream file to client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${assignment.fileName}"`,
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading assignment:", error);
    res.status(500).json({ message: "Failed to download assignment" });
  }
};

/**
 * Download Submission PDF (Student who submitted it and Teacher of the class)
 */
export const downloadSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const submission =
      await Submission.findById(submissionId).populate("assignmentId");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Authorization check
    if (userRole === "student") {
      const student = await Student.findOne({ userId });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Student must be the submitter
      if (student._id.toString() !== submission.studentId.toString()) {
        return res.status(403).json({
          message: "You do not have permission to access this submission",
        });
      }
    } else if (userRole === "teacher") {
      const teacher = await Teacher.findOne({ userId });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      // Teacher must be the assignment creator
      if (
        teacher._id.toString() !== submission.assignmentId.teacherId.toString()
      ) {
        return res.status(403).json({
          message: "You do not have permission to access this submission",
        });
      }
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    // Security: Prevent directory traversal
    const filePath = path.resolve(submission.filePath);
    const uploadsDir = path.resolve("./uploads");

    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({ message: "Invalid file path" });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Stream file to client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${submission.fileName}"`,
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading submission:", error);
    res.status(500).json({ message: "Failed to download submission" });
  }
};

/**
 * Download Notes PDF (Students in the class and Teacher who uploaded it)
 */
export const downloadNotes = async (req, res) => {
  try {
    const { notesId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const notes = await Notes.findById(notesId);
    if (!notes) {
      return res.status(404).json({ message: "Notes not found" });
    }

    // Authorization check
    if (userRole === "student") {
      const student = await Student.findOne({ userId });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Student must be in the notes' class
      if (student.classId.toString() !== notes.classId.toString()) {
        return res.status(403).json({
          message: "You do not have permission to access these notes",
        });
      }
    } else if (userRole === "teacher") {
      const teacher = await Teacher.findOne({ userId });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      // Teacher must be the uploader
      if (teacher._id.toString() !== notes.teacherId.toString()) {
        return res.status(403).json({
          message: "You do not have permission to access these notes",
        });
      }
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    // Security: Prevent directory traversal
    const filePath = path.resolve(notes.filePath);
    const uploadsDir = path.resolve("./uploads");

    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({ message: "Invalid file path" });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Stream file to client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${notes.fileName}"`,
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading notes:", error);
    res.status(500).json({ message: "Failed to download notes" });
  }
};
