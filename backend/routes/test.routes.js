import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/student",
  protect,
  allowRoles("student"),
  (req, res) => {
    res.json({
      message: "Student access granted",
      user: req.user,
    });
  }
);

router.get(
  "/teacher",
  protect,
  allowRoles("teacher"),
  (req, res) => {
    res.json({
      message: "Teacher access granted",
      user: req.user,
    });
  }
);

export default router;
