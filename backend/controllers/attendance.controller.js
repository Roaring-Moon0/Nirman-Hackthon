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
      return res.json({
        message: "No classes scheduled for weekends",
        classes: [],
      });
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
      return res.status(403).json({
        message: "You are not authorized to take attendance for this class",
      });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    const createdRecords = [];

    // Process each attendance record
    for (const record of attendanceRecords) {
      const { studentId, isPresent } = record;

      // Calculate new absence streak
      let consecutiveAbsenceStreak = 0;
      if (!isPresent) {
        consecutiveAbsenceStreak =
          await calculateConsecutiveAbsenceStreak(studentId);
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
          { upsert: true, new: true },
        );

        createdRecords.push(attendance);
      } catch (err) {
        console.error(
          `Error recording attendance for student ${studentId}:`,
          err,
        );
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
      "loginId",
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
/**
 * Get daily class attendance
 * GET /api/teacher/attendance/:classId?date=YYYY-MM-DD
 */
export const getAttendanceByClassAndDate = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;
    const teacherId = req.user.userId;

    if (!classId || !date) {
      return res
        .status(400)
        .json({ message: "Class ID and Date are required" });
    }

    // 1. Verify Teacher owns this class
    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher || !teacher.assignedClasses.includes(classId)) {
      // Fallback check against ClassAssignment if array sync failed (Defensive)
      const assignment = await import("../models/ClassAssignment.js").then(
        (m) => m.ClassAssignment.findOne({ teacherId: teacher._id, classId }),
      );
      if (!assignment && !teacher.assignedClasses.includes(classId)) {
        return res
          .status(403)
          .json({ message: "Not authorized for this class" });
      }
    }

    // 2. Get Students (Strict Linkage)
    const students = await Student.find({ classId }).select(
      "name rollNo userId",
    );

    // 3. Get Attendance Records
    const queryDate = new Date(date);
    // Be careful with timezones. Best to search range for that day.
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const records = await Attendance.find({
      classId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // 4. Merge
    const result = students.map((student) => {
      const record = records.find(
        (r) => r.studentId.toString() === student._id.toString(),
      );
      return {
        studentId: student._id,
        name: student.name,
        rollNo: student.rollNo,
        status: record ? record.status : null, // null means not marked
        isPresent: record ? record.isPresent : null,
      };
    });

    res.json({
      date,
      classId,
      students: result,
    });
  } catch (error) {
    console.error("Get Attendance Error:", error);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

/**
 * Submit daily class attendance
 * POST /api/teacher/attendance/:classId
 */
export const submitClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, records } = req.body; // records: [{ studentId, status }]
    const teacherId = req.user.userId;

    if (!date || !Array.isArray(records)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    // 1. Verify Teacher
    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher || !teacher.assignedClasses.includes(classId)) {
      return res.status(403).json({ message: "Not authorized for this class" });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(12, 0, 0, 0); // Noon to avoid timezone shifts affecting date part

    const operations = records.map(({ studentId, status }) => {
      const isPresent = status === "present";
      return {
        updateOne: {
          filter: {
            studentId,
            classId,
            date: attendanceDate,
          },
          update: {
            $set: {
              teacherId: teacher._id,
              status,
              isPresent, // Sync legacy field
              subjectId: null, // Daily attendance
              timetableId: null,
            },
          },
          upsert: true,
        },
      };
    });

    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);
    }

    res.json({
      message: "Attendance saved successfully",
      count: operations.length,
    });
  } catch (error) {
    console.error("Submit Attendance Error:", error);
    res.status(500).json({ message: "Failed to submit attendance" });
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
      "classCode",
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Use current attendance summary
    const totalDays = await Attendance.countDocuments({
      studentId: student._id,
    });
    const presentDays = await Attendance.countDocuments({
      studentId: student._id,
      status: "present",
    });

    const percentage =
      totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // Get recent history (limit 5)
    const recent = await Attendance.find({ studentId: student._id })
      .sort({ date: -1 })
      .limit(5)
      .select("date status");

    res.json({
      student: {
        rollNo: student.rollNo,
        name: student.name,
        classCode: student.classId?.classCode || "N/A",
      },
      metrics: {
        totalClasses: totalDays,
        presentClasses: presentDays, // ROI: Matches frontend presentClasses
        absentClasses: totalDays - presentDays,
        percentage: percentage, // ROI: Matches frontend percentage
      },
      recentAttendance: recent,
      history: recent,
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance data" });
  }
};
