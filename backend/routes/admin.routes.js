import express from "express";
import {
  addClass,
  addSubject,
  addStudent,
  addTeacher,
} from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/class", adminAuth, addClass);
router.post("/subject", adminAuth, addSubject);
router.post("/student", adminAuth, addStudent);
router.post("/teacher", adminAuth, addTeacher);
router.get("/ping", (req, res) => {
  res.send("admin alive");
});

export default router;
