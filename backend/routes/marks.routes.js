import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  addMarks,
  getExamMarks,
  getStudentMarks,
  getClassMarksReport,
  getMarksTrendData,
} from "../controllers/marks.controller.js";

const router = express.Router();

// Teacher routes
router.post("/add", protect, allowRoles("teacher"), addMarks);
router.get("/exam", protect, getExamMarks);
router.get("/class-report", protect, allowRoles("teacher"), getClassMarksReport);

// Student routes
router.get("/my", protect, allowRoles("student"), getStudentMarks);
router.get("/trend", protect, allowRoles("student"), getMarksTrendData);

export default router;
