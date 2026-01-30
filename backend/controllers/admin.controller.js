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

    if (!teacherId || !classId || !subjectId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Maintain Junction Table (Optional but good for history/subjects)
    const existing = await ClassAssignment.findOne({
      teacherId,
      classId,
      subjectId,
    });
    if (existing) {
      return res.status(400).json({ message: "Assignment already exists" });
    }

    const assignment = await ClassAssignment.create({
      teacherId,
      classId,
      subjectId,
    });

    // 2. Strict Linkage Updates
    // A. Add Class to Teacher
    await Teacher.findByIdAndUpdate(teacherId, {
      $addToSet: { assignedClasses: classId },
    });

    // B. Add Teacher to Class
    await Class.findByIdAndUpdate(classId, {
      $addToSet: { teachers: teacherId },
    });

    // C. Auto-link Teacher to ALL Students in that Class
    await Student.updateMany(
      { classId: classId },
      { $addToSet: { assignedTeachers: teacherId } },
    );

    console.log(
      `[DEBUG] Full Linkage Complete: Teacher ${teacherId} <-> Class ${classId}`,
    );

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
    const students = await Student.find({ isActive: true }).populate(
      "classId",
      "classCode",
    );
    const teachers = await Teacher.find({ isActive: true });

    const formattedStudents = students.map((s) => ({
      id: s._id,
      name: s.name,
      role: "Student",
      info: s.rollNo,
      status: s.isActive ? "Active" : "Inactive",
      classCode: s.classId?.classCode || "N/A",
    }));

    const formattedTeachers = teachers.map((t) => ({
      id: t._id,
      name: t.name,
      role: "Teacher",
      info: t.department,
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

    const assignments = await ClassAssignment.find({ teacherId: id });
    if (assignments.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete: Teacher has active class assignments. Unassign first.",
        });
    }

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

    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(id);

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
    if (!attendanceId)
      return res.status(400).json({ message: "Attendance ID required" });

    // Dynamic import to avoid circular dependency issues if any
    const { Attendance } = await import("../models/Attendance.js");
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance)
      return res.status(404).json({ message: "Attendance record not found" });

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

/* ================= ASSIGN STUDENTS TO CLASS ================= */
export const assignStudentsToClass = async (req, res) => {
  try {
    const { classId, studentIds } = req.body;

    if (
      !classId ||
      !studentIds ||
      !Array.isArray(studentIds) ||
      studentIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Class ID and a list of Student IDs are required" });
    }

    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 1. Update Students: Set classId
    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { classId: classId } },
    );

    // 2. Add Students to Class Array
    await Class.findByIdAndUpdate(classId, {
      $addToSet: { students: { $each: studentIds } },
    });

    // 3. Auto-link Class Teachers to these Students
    // If the class already has teachers, map them to the new students
    if (classExists.teachers && classExists.teachers.length > 0) {
      await Student.updateMany(
        { _id: { $in: studentIds } },
        { $addToSet: { assignedTeachers: { $each: classExists.teachers } } },
      );
    }

    res.status(200).json({
      message: `${result.modifiedCount} students assigned to ${classExists.classCode}`,
    });
  } catch (err) {
    console.error("Assign students error:", err);
    res.status(500).json({ message: "Failed to assign students" });
  }
};

/* ================= UNASSIGN TEACHER ================= */
export const unassignTeacherFromClass = async (req, res) => {
  try {
    const { assignmentId, teacherId, classId, subjectId } = req.body;

    // Find the assignment first to get IDs if only assignmentId provided
    let query = {};
    if (assignmentId) query = { _id: assignmentId };
    else if (teacherId && classId && subjectId)
      query = { teacherId, classId, subjectId };
    else
      return res
        .status(400)
        .json({ message: "Insufficient data to identify assignment" });

    const assignment = await ClassAssignment.findOne(query);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const { teacherId: tId, classId: cId } = assignment;

    // 1. Remove Junction
    await ClassAssignment.findByIdAndDelete(assignment._id);

    // 2. Strict Linkage Cleanup
    // A. Remove Class from Teacher
    await Teacher.findByIdAndUpdate(tId, {
      $pull: { assignedClasses: cId },
    });

    // B. Remove Teacher from Class
    await Class.findByIdAndUpdate(cId, {
      $pull: { teachers: tId },
    });

    // C. Remove Teacher from Students in that Class
    await Student.updateMany(
      { classId: cId },
      { $pull: { assignedTeachers: tId } },
    );

    res.status(200).json({ message: "Teacher unassigned successfully" });
  } catch (err) {
    console.error("Unassign teacher error:", err);
    res.status(500).json({ message: "Failed to unassign teacher" });
  }
};

/* ================= GET TEACHER ASSIGNMENTS ================= */
export const getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await ClassAssignment.find()
      .populate("teacherId", "name employeeId department")
      .populate("classId", "classCode section year")
      .populate("subjectId", "subjectName subjectCode")
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (err) {
    console.error("Get assignments error:", err);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

/* ================= GET CLASS STUDENTS ================= */
export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.query;
    let query = { isActive: true };

    if (classId) {
      query.classId = classId;
    }

    const students = await Student.find(query)
      .populate("classId", "classCode section year")
      .sort({ "classId.classCode": 1, rollNo: 1 });

    const data = students.map((s) => ({
      _id: s._id,
      name: s.name,
      rollNo: s.rollNo,
      classId: s.classId?._id,
      className: s.classId
        ? `${s.classId.classCode} (Year ${s.classId.year})`
        : "Unassigned",
    }));

    res.status(200).json(data);
  } catch (err) {
    console.error("Get class students error:", err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};
