import { Marks } from "../models/Marks.js";
import { Teacher } from "../models/teacher.model.js";
import { Student } from "../models/student.model.js";
import { Subject } from "../models/subject.model.js";
import {
  calculateMarksTrend,
  getStudentMarksMetrics,
  getMarksBySubject,
} from "../utils/marksUtils.js";

/**
 * Add marks for a student (teacher only)
 */
export const addMarks = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const {
      studentId,
      classId,
      subjectId,
      examName,
      obtainedMarks,
      totalMarks,
      examDate,
    } = req.body;

    // Validate inputs
    if (
      !studentId ||
      !classId ||
      !subjectId ||
      !examName ||
      obtainedMarks === undefined ||
      !totalMarks ||
      !examDate
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify teacher exists
    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Validate marks
    if (obtainedMarks > totalMarks || obtainedMarks < 0 || totalMarks <= 0) {
      return res.status(400).json({ message: "Invalid marks values" });
    }

    // Create or update marks record
    const marks = await Marks.findOneAndUpdate(
      {
        studentId,
        subjectId,
        examName,
      },
      {
        classId,
        teacherId: teacher._id,
        obtainedMarks,
        totalMarks,
        examDate: new Date(examDate),
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "Marks recorded successfully",
      marks,
    });
  } catch (error) {
    console.error("Error adding marks:", error);
    res.status(500).json({ message: "Failed to add marks" });
  }
};

/**
 * Get marks for a specific exam (teacher or student)
 */
export const getExamMarks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { examName, classId } = req.query;

    if (!examName) {
      return res.status(400).json({ message: "examName is required" });
    }

    let query = { examName };

    if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      query.teacherId = teacher._id;
      if (classId) {
        query.classId = classId;
      }
    } else if (req.user.role === "student") {
      const student = await Student.findOne({ userId });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      query.studentId = student._id;
    }

    const marks = await Marks.find(query)
      .populate("studentId", "rollNo name")
      .populate("subjectId", "subjectName subjectCode")
      .sort({ examDate: -1 });

    res.json({
      examName,
      marksCount: marks.length,
      marks,
    });
  } catch (error) {
    console.error("Error fetching exam marks:", error);
    res.status(500).json({ message: "Failed to fetch marks" });
  }
};

/**
 * Get student's marks (student dashboard)
 */
export const getStudentMarks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await Student.findOne({ userId }).populate("classId");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const marks = await Marks.find({ studentId: student._id })
      .populate("subjectId", "subjectName subjectCode")
      .sort({ examDate: -1 });

    const metrics = await getStudentMarksMetrics(
      student._id,
      student.classId._id
    );

    res.json({
      student: {
        rollNo: student.rollNo,
        name: student.name,
      },
      metrics,
      marks,
    });
  } catch (error) {
    console.error("Error fetching student marks:", error);
    res.status(500).json({ message: "Failed to fetch marks" });
  }
};

/**
 * Get class marks report (teacher only)
 */
export const getClassMarksReport = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { classId, examName } = req.query;

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    let query = { classId, teacherId: teacher._id };
    if (examName) {
      query.examName = examName;
    }

    const marks = await Marks.find(query)
      .populate("studentId", "rollNo name")
      .populate("subjectId", "subjectName subjectCode")
      .sort({ examDate: -1 });

    // Group by exam
    const groupedByExam = {};
    marks.forEach((mark) => {
      if (!groupedByExam[mark.examName]) {
        groupedByExam[mark.examName] = [];
      }
      groupedByExam[mark.examName].push(mark);
    });

    res.json({
      classId,
      exams: Object.keys(groupedByExam),
      marksData: groupedByExam,
    });
  } catch (error) {
    console.error("Error fetching class marks report:", error);
    res.status(500).json({ message: "Failed to fetch marks report" });
  }
};

/**
 * Get marks trend for a student (all subjects or specific subject)
 */
export const getMarksTrendData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subjectId } = req.query;

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (subjectId) {
      // Get trend for specific subject
      const trend = await calculateMarksTrend(student._id, subjectId);
      const subjectMarks = await Marks.find({
        studentId: student._id,
        subjectId,
      }).sort({ examDate: 1 });

      res.json({
        subjectId,
        trend,
        marks: subjectMarks,
      });
    } else {
      // Get trend for all subjects
      const marksBySubject = await getMarksBySubject(student._id);
      res.json({
        student: student._id,
        marksBySubject,
      });
    }
  } catch (error) {
    console.error("Error fetching marks trend:", error);
    res.status(500).json({ message: "Failed to fetch marks trend" });
  }
};
