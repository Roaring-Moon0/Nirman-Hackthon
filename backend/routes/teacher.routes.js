import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  uploadAssignment,
  uploadNotes,
  handleUploadError,
} from "../middleware/upload.middleware.js";

// Import from teacher.controller.js (only what exists)
import {
  getTeacherDashboard,
  getTeacherComprehensiveDashboard,
  getClassHighRiskStudents,
  getStudentAnalytics,
  getTeacherClasses,
  getStudentsByClass,
} from "../controllers/teacher.controller.js";

// Import from assignment.controller.js
import {
  uploadAssignment as createAssignment,
  uploadNotes as uploadNotesHandler,
  getClassAssignments,
  getClassNotes,
} from "../controllers/assignment.controller.js";

const router = express.Router();

// Dashboard routes
router.get("/dashboard", protect, allowRoles("teacher"), getTeacherDashboard);

router.get(
  "/dashboard-comprehensive",
  protect,
  allowRoles("teacher"),
  getTeacherComprehensiveDashboard,
);

router.get(
  "/high-risk-students",
  protect,
  allowRoles("teacher"),
  getClassHighRiskStudents,
);

router.get(
  "/student-analytics",
  protect,
  allowRoles("teacher"),
  getStudentAnalytics,
);

// Assignment routes
router.post(
  "/assignment/create",
  protect,
  allowRoles("teacher"),
  uploadAssignment.single("file"),
  handleUploadError,
  createAssignment,
);

router.get("/assignments", protect, allowRoles("teacher"), getClassAssignments);

// Notes routes
router.post(
  "/notes/upload",
  protect,
  allowRoles("teacher"),
  uploadNotes.single("file"),
  handleUploadError,
  uploadNotesHandler,
);

router.get("/notes", protect, allowRoles("teacher"), getClassNotes);

// Classes routes (NOW ENABLED)
router.get("/classes", protect, allowRoles("teacher"), getTeacherClasses);
router.get(
  "/classes/:classId/students",
  protect,
  allowRoles("teacher"),
  getStudentsByClass,
);

// Attendance (Dynamic import to avoid circular dependency)
// router.post(
//   "/attendance/mark",
//   protect,
//   allowRoles("teacher"),
//   async (req, res, next) => {
//     const { markAttendance } =
//       await import("../controllers/teacher.controller.js");
//     markAttendance(req, res, next);
//   },
// );

export default router;
