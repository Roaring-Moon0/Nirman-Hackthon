import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  getStudentDashboard,
  getStudentAcademicOverview,
  getStudentRiskLevel,
} from "../controllers/student.controller.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  allowRoles("student"),
  getStudentDashboard
);

router.get(
  "/academic-overview",
  protect,
  allowRoles("student"),
  getStudentAcademicOverview
);

router.get(
  "/risk-level",
  protect,
  allowRoles("student"),
  getStudentRiskLevel
);

export default router;
