import { Attendance } from "../models/Attendance.js";
import { Timetable } from "../models/Timetable.js";
import { Teacher } from "../models/teacher.model.js";
import { Student } from "../models/student.model.js";
import { Class } from "../models/class.model.js";
import { Subject } from "../models/subject.model.js";
import {
  calculateConsecutiveAbsenceStreak,
  getStudentAttendanceMetrics,
} from "../utils/attendanceUtils.js";

/**
 * Get today's timetable for a teacher
 */
export const getTodayTimetable = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const teacher = await Teacher.findOne({ userId: teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Get current day of week
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const dayOfWeek = daysOfWeek[today.getDay()];

    if (dayOfWeek === "Sun" || dayOfWeek === "Sat") {
      return res.json({ message: "No classes scheduled for weekends", classes: [] });
    }

    const todayTimetable = await Timetable.find({
      teacherId: teacher._id,
      dayOfWeek,
    })
      .populate("classId", "classCode year section")
      .populate("subjectId", "subjectName subjectCode");

    res.json({
      day: dayOfWeek,
      classes: todayTimetable,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch today's timetable" });
  }
};

/**
 * Take attendance for a class-subject lecture
 */
export const takeAttendance = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { timetableId, classId, subjectId, attendanceRecords, date } =
      req.body;

    // Validate inputs
    if (!timetableId || !classId || !subjectId || !attendanceRecords) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Verify teacher teaches this class-subject
    const timetable = await Timetable.findById(timetableId);
    if (
      !timetable ||
      timetable.teacherId.toString() !== teacher._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to take attendance for this class" });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    const createdRecords = [];

    // Process each attendance record
    for (const record of attendanceRecords) {
      const { studentId, isPresent } = record;

      // Calculate new absence streak
      let consecutiveAbsenceStreak = 0;
      if (!isPresent) {
        consecutiveAbsenceStreak = await calculateConsecutiveAbsenceStreak(
          studentId
        );
        consecutiveAbsenceStreak += 1;
      }

      try {
        const attendance = await Attendance.findOneAndUpdate(
          {
            studentId,
            classId,
            subjectId,
            timetableId,
            date: attendanceDate,
          },
          {
            isPresent,
            consecutiveAbsenceStreak,
          },
          { upsert: true, new: true }
        );

        createdRecords.push(attendance);
      } catch (err) {
        console.error(`Error recording attendance for student ${studentId}:`, err);
      }
    }

    res.json({
      message: "Attendance recorded successfully",
      recordsCreated: createdRecords.length,
      records: createdRecords,
    });
  } catch (error) {
    console.error("Error taking attendance:", error);
    res.status(500).json({ message: "Failed to record attendance" });
  }
};

/**
 * Get class attendance report (for teacher)
 */
export const getClassAttendanceReport = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { classId, subjectId } = req.query;

    if (!classId || !subjectId) {
      return res
        .status(400)
        .json({ message: "classId and subjectId are required" });
    }

    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Get all students in the class
    const students = await Student.find({ classId }).populate(
      "userId",
      "loginId"
    );

    const reportData = [];

    for (const student of students) {
      const metrics = await getStudentAttendanceMetrics(student._id, classId);
      reportData.push({
        studentId: student._id,
        rollNo: student.rollNo,
        name: student.name,
        ...metrics,
      });
    }

    res.json({
      classId,
      subjectId,
      totalStudents: students.length,
      attendanceReport: reportData,
    });
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    res.status(500).json({ message: "Failed to fetch attendance report" });
  }
};

/**
 * Get student's attendance data (for student dashboard)
 */
export const getStudentAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await Student.findOne({ userId }).populate(
      "classId",
      "classCode"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const metrics = await getStudentAttendanceMetrics(
      student._id,
      student.classId._id
    );

    res.json({
      student: {
        rollNo: student.rollNo,
        name: student.name,
        classCode: student.classId.classCode,
      },
      attendance: metrics,
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance data" });
  }
};
