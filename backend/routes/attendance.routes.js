import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  getTodayTimetable,
  takeAttendance,
  getClassAttendanceReport,
  getStudentAttendance,
} from "../controllers/attendance.controller.js";

const router = express.Router();

// Teacher routes
router.get("/today-timetable", protect, allowRoles("teacher"), getTodayTimetable);
router.post("/take", protect, allowRoles("teacher"), takeAttendance);
router.get(
  "/class-report",
  protect,
  allowRoles("teacher"),
  getClassAttendanceReport
);

// Student routes
router.get("/my", protect, allowRoles("student"), getStudentAttendance);

export default router;
