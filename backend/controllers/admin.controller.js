import bcrypt from "bcryptjs";
import { Class } from "../models/class.model.js";
import { Subject } from "../models/subject.model.js";
import { User } from "../models/User.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import { ClassAssignment } from "../models/ClassAssignment.js";
import { Timetable } from "../models/Timetable.js";

/* ================= ADD CLASS ================= */
export const addClass = async (req, res) => {
  try {
    const { classCode, department, course, year, section } = req.body;

    const existing = await Class.findOne({ classCode });
    if (existing) {
      return res.status(400).json({ message: "Class already exists" });
    }

    const newClass = await Class.create({
      classCode,
      department,
      course,
      year,
      section,
    });

    res.status(201).json({ message: "Class created", data: newClass });
  } catch (err) {
    res.status(500).json({ message: "Failed to create class" });
  }
};

/* ================= ADD SUBJECT ================= */
export const addSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, semester, department } = req.body;

    const existing = await Subject.findOne({ subjectCode });
    if (existing) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    const subject = await Subject.create({
      subjectCode,
      subjectName,
      semester,
      department,
    });

    res.status(201).json({ message: "Subject created", data: subject });
  } catch (err) {
    res.status(500).json({ message: "Failed to create subject" });
  }
};

/* ================= ADD STUDENT ================= */
export const addStudent = async (req, res) => {
  try {
    const { rollNo, name, classCode } = req.body;

    const existingUser = await User.findOne({ loginId: rollNo });
    if (existingUser) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const classData = await Class.findOne({ classCode });
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    const hashedPassword = await bcrypt.hash("college@123", 10);

    const user = await User.create({
      loginId: rollNo,
      password: hashedPassword,
      role: "student",
      isActive: true,
    });

    const student = await Student.create({
      userId: user._id,
      rollNo,
      name,
      classId: classData._id,
      isActive: true,
    });

    res.status(201).json({
      message: "Student added successfully",
      student,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add student" });
  }
};

/* ================= ADD TEACHER ================= */
export const addTeacher = async (req, res) => {
  try {
    const { employeeId, name, department, designation } = req.body;

    const existingUser = await User.findOne({ loginId: employeeId });
    if (existingUser) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    const hashedPassword = await bcrypt.hash("college@123", 10);

    const user = await User.create({
      loginId: employeeId,
      password: hashedPassword,
      role: "teacher",
      isActive: true,
    });

    const teacher = await Teacher.create({
      userId: user._id,
      employeeId,
      name,
      department,
      designation,
      isActive: true,
    });

    res.status(201).json({
      message: "Teacher added successfully",
      teacher,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add teacher" });
  }
};

/* ================= ASSIGN TEACHER TO CLASS ================= */
export const assignTeacherToClass = async (req, res) => {
  try {
    const { teacherId, classId, subjectId } = req.body;

    // Validation
    if (!teacherId || !classId || !subjectId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if assignment already exists
    const existing = await ClassAssignment.findOne({
      teacherId,
      classId,
      subjectId,
    });

    if (existing) {
      return res.status(400).json({ message: "As1signment already exists" });
    }

    const assignment = await ClassAssignment.create({
      teacherId,
      classId,
      subjectId,
    });

    console.log(`[DEBUG] ClassAssignment Saved! ID: ${assignment._id}`);
    console.log(`[DEBUG] Verify manually in collection: 'classassignments'`);

    res.status(201).json({
      message: "Teacher assigned successfully",
      assignment,
    });
  } catch (err) {
    console.error("Assign teacher error:", err);
    res.status(500).json({ message: "Failed to assign teacher" });
  }
};

/* ================= CREATE TIMETABLE ================= */
export const createTimetable = async (req, res) => {
  try {
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime } =
      req.body;

    // Validation
    if (
      !classId ||
      !subjectId ||
      !teacherId ||
      !dayOfWeek ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check conflict (simple check: same teacher at same time)
    const conflict = await Timetable.findOne({
      teacherId,
      dayOfWeek,
      startTime,
    });

    if (conflict) {
      return res
        .status(400)
        .json({ message: "Teacher already booked at this time" });
    }

    const timetable = await Timetable.create({
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
    });

    console.log(`[DEBUG] Timetable Saved! ID: ${timetable._id}`);

    res.status(201).json({
      message: "Timetable created successfully",
      timetable,
    });
  } catch (err) {
    console.error("Create timetable error:", err);
    res.status(500).json({ message: "Failed to create timetable" });
  }
};

/* ================= GET DASHBOARD STATS ================= */
export const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments({ isActive: true });
    const teacherCount = await Teacher.countDocuments({ isActive: true });
    const classCount = await Class.countDocuments();
    const subjectCount = await Subject.countDocuments();

    res.status(200).json({
      studentCount,
      teacherCount,
      classCount,
      subjectCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

/* ================= GET ALL USERS (Students & Teachers) ================= */
export const getAllUsers = async (req, res) => {
  try {
    // Fetch students with class info
    const students = await Student.find({ isActive: true }).populate(
      "classId",
      "classCode",
    );
    // Fetch teachers
    const teachers = await Teacher.find({ isActive: true });

    // Format response
    const formattedStudents = students.map((s) => ({
      id: s._id,
      name: s.name,
      role: "Student",
      info: s.rollNo, // Display Roll No
      status: s.isActive ? "Active" : "Inactive",
      classCode: s.classId?.classCode || "N/A",
    }));

    const formattedTeachers = teachers.map((t) => ({
      id: t._id,
      name: t.name,
      role: "Teacher",
      info: t.department, // Display Dept
      status: t.isActive ? "Active" : "Inactive",
    }));

    res.status(200).json([...formattedStudents, ...formattedTeachers]);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ================= GET ALL CLASSES ================= */
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};

/* ================= GET ALL SUBJECTS ================= */
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};

/* ================= DELETE TEACHER ================= */
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Deactivate instead of hard delete to preserve history (recommended for ERP)
    // But requirement says "Delete", ensuring dependencies check.

    // Check assignments
    const assignments = await ClassAssignment.find({ teacherId: id });
    if (assignments.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete: Teacher has active class assignments. Unassign first.",
        });
    }

    // Delete User and Teacher
    await User.findByIdAndDelete(teacher.userId);
    await Teacher.findByIdAndDelete(id);

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete teacher" });
  }
};

/* ================= DELETE STUDENT ================= */
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check data dependencies? Usually we want to keep academic record.
    // For now, we'll Soft Delete by deactivating, or Hard Delete if requested.
    // Prompt implies immediate action. Let's do Hard Delete but warn if active.

    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(id);
    // Optional: Delete attendance/marks or keep them as orphaned records?
    // Usually keep for analytics, but let's stick to simple deletion for now.

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete student" });
  }
};

/* ================= DELETE CLASS ================= */
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if students exist in this class
    const studentCount = await Student.countDocuments({ classId: id });
    if (studentCount > 0) {
      return res
        .status(400)
        .json({
          message: `Cannot delete: Class has ${studentCount} students.`,
        });
    }

    await Class.findByIdAndDelete(id);
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete class" });
  }
};

/* ================= OVERRIDE ATTENDANCE ================= */
export const overrideAttendance = async (req, res) => {
  try {
    const { attendanceId, isPresent, reason } = req.body;

    // Admin can override at ANY time, even after 11:59 PM.

    /* 
       We might receive attendanceId directly OR studentId+date+classId.
       Let's assume we receive attendanceId for update, or enough info to find it.
       If creating new override for missing record, we need more info.
       For this v1, let's assume updating an existing record or 'upsert'.
    */

    // For simplicity, let's assume we edit an existing record found via analytics/list
    if (!attendanceId) {
      return res.status(400).json({ message: "Attendance ID required" });
    }

    const attendance = await import("../models/Attendance.js").then((m) =>
      m.Attendance.findById(attendanceId),
    );

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    attendance.isPresent = isPresent;
    attendance.isOverridden = true;
    attendance.overrideReason = reason || "Admin Override";
    await attendance.save();

    res
      .status(200)
      .json({ message: "Attendance updated successfully", data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to override attendance" });
  }
};

/* ================= TOGGLE USER STATUS ================= */
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = isActive;
    await user.save();

    // Also update specific role model
    if (user.role === "student") {
      await Student.updateOne({ userId: user._id }, { isActive });
    } else if (user.role === "teacher") {
      await Teacher.updateOne({ userId: user._id }, { isActive });
    }

    res
      .status(200)
      .json({ message: `User ${isActive ? "activated" : "deactivated"}` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!newPassword)
      return res.status(400).json({ message: "New password required" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset password" });
  }
};
