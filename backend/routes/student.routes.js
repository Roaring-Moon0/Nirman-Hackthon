import express from "express";
import {
  getStudentDashboard,
  getStudentAcademicOverview,
  getStudentRiskLevel,
  submitAssignment,
  getStudentAssignments,
  getStudentNotes,
  submitSelfDeclaration,
  getStudentRoadmap,
  explainTopicSimply,
  getStudentAttendanceHistory,
  getMyTeachers,
} from "../controllers/student.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { uploadSubmission } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, allowRoles("student"), getStudentDashboard);
router.get(
  "/academic-overview",
  protect,
  allowRoles("student"),
  getStudentAcademicOverview,
);
router.get("/risk-level", protect, allowRoles("student"), getStudentRiskLevel);
router.post(
  "/submit-assignment",
  protect,
  allowRoles("student"),
  uploadSubmission.single("file"),
  submitAssignment,
);
router.get(
  "/assignments",
  protect,
  allowRoles("student"),
  getStudentAssignments,
);
router.get("/notes", protect, allowRoles("student"), getStudentNotes);
router.get(
  "/attendance",
  protect,
  allowRoles("student"),
  getStudentAttendanceHistory,
);

router.get("/my-teachers", protect, allowRoles("student"), getMyTeachers);

// New Core Features
router.post(
  "/self-declare",
  protect,
  allowRoles("student"),
  submitSelfDeclaration,
);
router.get("/roadmap", protect, allowRoles("student"), getStudentRoadmap);
router.post(
  "/explain-topic",
  protect,
  allowRoles("student"),
  explainTopicSimply,
);

export default router;
