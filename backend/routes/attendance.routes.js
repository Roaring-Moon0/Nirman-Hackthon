import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  getTodayTimetable,
  takeAttendance,
  getClassAttendanceReport,
  getStudentAttendance,
  getAttendanceByClassAndDate,
  submitClassAttendance,
} from "../controllers/attendance.controller.js";

const router = express.Router();

// Teacher routes
// Note: Put specific routes before query parameter routes if conflict, but here we use /:classId parameter.
// GET /api/attendance/teacher/:classId -> Get specific class attendance
router.get(
  "/teacher/:classId",
  protect,
  allowRoles("teacher"),
  getAttendanceByClassAndDate,
);
router.post(
  "/teacher/:classId",
  protect,
  allowRoles("teacher"),
  submitClassAttendance,
);

// Legacy/Compatibility routes
router.get(
  "/today-timetable",
  protect,
  allowRoles("teacher"),
  getTodayTimetable,
);
router.post("/take", protect, allowRoles("teacher"), takeAttendance);
router.get(
  "/class-report",
  protect,
  allowRoles("teacher"),
  getClassAttendanceReport,
);

// Student routes
router.get("/my", protect, allowRoles("student"), getStudentAttendance);

export default router;
