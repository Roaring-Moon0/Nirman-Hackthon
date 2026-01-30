import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  downloadAssignment,
  downloadSubmission,
  downloadNotes,
} from "../controllers/download.controller.js";

const router = express.Router();

// Download routes (both students and teachers can use these)
router.get("/assignment/:assignmentId", protect, downloadAssignment);

router.get("/submission/:submissionId", protect, downloadSubmission);

router.get("/notes/:notesId", protect, downloadNotes);

export default router;
