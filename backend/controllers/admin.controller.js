import bcrypt from "bcryptjs";
import { Class } from "../models/class.model.js";
import { Subject } from "../models/subject.model.js";
import { User } from "../models/User.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";

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
