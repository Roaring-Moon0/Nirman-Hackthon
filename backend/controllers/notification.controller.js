import { Notification } from "../models/notification.model.js";
import { checkAndCreateNotifications } from "../services/notification.service.js";

/**
 * GET /api/student/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const studentId = req.user.profile._id; // Auth middleware attaches profile for student role?
    // Wait, auth middleware usually attaches `req.user = { userId, role }`.
    // Profile might not be attached unless we updated middleware.
    // Let's assume we need to fetch profile or use userId if Notification uses userId (User model) or studentId (Student model).
    // The Notification model uses `studentId` ref "Student".
    // So we need the Student ID.
    // Let's fetch it or rely on `req.profile` if `allowRoles` adds it.
    // Actually, `allowRoles` just checks role.

    // We should fetch Student ID from User ID.
    // Or, for efficiency, just store notifications by UserID?
    // Model says `studentId` ref `Student`.
    // So we need to query Student model to get `_id` from `req.user.userId`.

    // Correction: Let's use `checkAndCreateNotifications` which needs studentId.
    // We can get studentId from `req.user.profile` if we update the middleware,
    // OR just query it here.
    // `req.query.studentId` is unsafe.

    // Let's import Student model to resolve ID.
    const { Student } = await import("../models/student.model.js");
    const student = await Student.findOne({ userId: req.user.userId });

    if (!student) {
      // Return empty array instead of 404 to avoid blocking UI
      return res.json([]);
    }

    // 1. Generate new alerts first
    await checkAndCreateNotifications(student._id);

    // 2. Fetch all
    const notifications = await Notification.find({ studentId: student._id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * PATCH /api/student/notifications/:id/read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
};

/**
 * PATCH /api/student/notifications/read-all
 */
export const markAllAsRead = async (req, res) => {
  try {
    const { Student } = await import("../models/student.model.js");
    const student = await Student.findOne({ userId: req.user.userId });

    if (student) {
      await Notification.updateMany(
        { studentId: student._id, isRead: false },
        { isRead: true },
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
};
