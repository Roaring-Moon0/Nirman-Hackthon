import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  getTeacherDashboard,
  getTeacherComprehensiveDashboard,
  getClassHighRiskStudents,
  getStudentAnalytics,
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  allowRoles("teacher"),
  getTeacherDashboard
);

router.get(
  "/dashboard-comprehensive",
  protect,
  allowRoles("teacher"),
  getTeacherComprehensiveDashboard
);

router.get(
  "/high-risk-students",
  protect,
  allowRoles("teacher"),
  getClassHighRiskStudents
);

router.get(
  "/student-analytics",
  protect,
  allowRoles("teacher"),
  getStudentAnalytics
);

export default router;
