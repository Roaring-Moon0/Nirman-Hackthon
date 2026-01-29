import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  uploadAssignment,
  uploadNotes,
  getClassAssignments,
  getClassNotes,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  getStudentSubmissions,
  downloadFile,
} from "../controllers/assignment.controller.js";
import {
  uploadAssignment as uploadAssignmentMiddleware,
  uploadSubmission as uploadSubmissionMiddleware,
  uploadNotes as uploadNotesMiddleware,
} from "../utils/multerConfig.js";

const router = express.Router();

// Assignment routes
router.post(
  "/upload",
  protect,
  allowRoles("teacher"),
  uploadAssignmentMiddleware.single("file"),
  uploadAssignment
);
router.get("/class", protect, getClassAssignments);
router.post(
  "/submit",
  protect,
  allowRoles("student"),
  uploadSubmissionMiddleware.single("file"),
  submitAssignment
);
router.get(
  "/submissions",
  protect,
  allowRoles("teacher"),
  getAssignmentSubmissions
);
router.post(
  "/grade",
  protect,
  allowRoles("teacher"),
  gradeSubmission
);
router.get("/my-submissions", protect, allowRoles("student"), getStudentSubmissions);

// Notes routes
router.post(
  "/notes/upload",
  protect,
  allowRoles("teacher"),
  uploadNotesMiddleware.single("file"),
  uploadNotes
);
router.get("/notes/class", protect, getClassNotes);

// File download
router.get("/download", protect, downloadFile);

export default router;
