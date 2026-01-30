import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import marksRoutes from "./routes/marks.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import downloadRoutes from "./routes/download.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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
// Assignments and Notes
app.use("/api/assignments", assignmentRoutes);

// Settings Module
import settingsRoutes from "./routes/settings.routes.js";
app.use("/api/student/settings", settingsRoutes);

// Notifications Module
import notificationRoutes from "./routes/notification.routes.js";
app.use("/api/student/notifications", notificationRoutes);

// Download routes (secure file access)
app.use("/api/download", downloadRoutes);

// Connect to database before starting server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();
