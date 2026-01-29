import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.routes.js";
import testRoutes from "./routes/test.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import marksRoutes from "./routes/marks.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

console.log("Routes loaded");

// Authentication
app.use("/api/auth", authRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Teacher endpoints
app.use("/api/teacher", teacherRoutes);

// Student endpoints
app.use("/api/student", studentRoutes);

// Attendance
app.use("/api/attendance", attendanceRoutes);

// Marks
app.use("/api/marks", marksRoutes);

// Assignments and Notes
app.use("/api/assignments", assignmentRoutes);

// Test routes (if needed)
app.use("/api/test", testRoutes);

connectDB();

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("How Are you mommy");
});

app.listen(port, () => {
  console.log("Server is running at port", port);
});
