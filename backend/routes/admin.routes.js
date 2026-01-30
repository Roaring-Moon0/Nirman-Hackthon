import express from "express";
import {
  addClass,
  addSubject,
  addStudent,
  addTeacher,
  assignTeacherToClass,
  createTimetable,
  getDashboardStats,
  getAllUsers,
  getAllClasses,
  getAllSubjects,
  deleteTeacher,
  deleteStudent,
  deleteClass,
  overrideAttendance,
  toggleUserStatus,
  resetPassword,
  assignStudentsToClass,
  unassignTeacherFromClass,
  getTeacherAssignments,
  getClassStudents,
} from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/class", adminAuth, addClass);
router.post("/subject", adminAuth, addSubject);
router.post("/student", adminAuth, addStudent);
router.post("/teacher", adminAuth, addTeacher);
router.post("/assign-teacher", adminAuth, assignTeacherToClass);
router.post("/timetable", adminAuth, createTimetable);

// Read Routes for Dashboard
router.get("/stats", adminAuth, getDashboardStats);
router.get("/users", adminAuth, getAllUsers);
router.get("/classes", adminAuth, getAllClasses);
router.get("/subjects", adminAuth, getAllSubjects);

// Delete Routes
router.delete("/teacher/:id", adminAuth, deleteTeacher);
router.delete("/student/:id", adminAuth, deleteStudent);
router.delete("/class/:id", adminAuth, deleteClass);

// Management Routes
router.patch("/attendance-override", adminAuth, overrideAttendance);
router.patch("/user-status", adminAuth, toggleUserStatus);
router.post("/reset-password", adminAuth, resetPassword);

// Assignment Routes
router.post("/assign-students", adminAuth, assignStudentsToClass);
router.delete("/unassign-teacher", adminAuth, unassignTeacherFromClass);
router.get("/teacher-assignments", adminAuth, getTeacherAssignments);
router.get("/class-students", adminAuth, getClassStudents);

router.get("/ping", adminAuth, (req, res) => {
  res.send("admin alive");
});

export default router;
