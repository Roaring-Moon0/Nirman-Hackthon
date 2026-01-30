import express from "express";
import {
  changePassword,
  requestEmailUpdate,
  verifyEmailOtp,
  getSettings,
} from "../controllers/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect); // All routes require login
router.use(allowRoles("student")); // Only students for now

router.get("/", getSettings);
router.post("/change-password", changePassword);
router.post("/request-email-update", requestEmailUpdate);
router.post("/verify-email-otp", verifyEmailOtp);

export default router;
