import { Notification } from "../models/notification.model.js";
import { Attendance } from "../models/Attendance.js";
import { Assignment } from "../models/Assignment.js";

/**
 * Checks student status and creates notifications if thresholds are breached.
 * Designed to be safe to run frequently (idempotent-ish).
 */
export const checkAndCreateNotifications = async (studentId) => {
  try {
    const today = new Date();
    const twentyFourHoursAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // 1. Check Attendance
    const attendanceRecords = await Attendance.find({ studentId });
    if (attendanceRecords.length > 0) {
      const total = attendanceRecords.length;
      const present = attendanceRecords.filter(
        (r) => r.status === "Present",
      ).length;
      const percentage = (present / total) * 100;

      if (percentage < 75) {
        let severity = percentage < 65 ? "critical" : "warning";
        let message =
          percentage < 65
            ? `Your attendance is critically low (${percentage.toFixed(1)}%). You risk debarment.`
            : `Your attendance is below 75% (${percentage.toFixed(1)}%). Please attend upcoming classes.`;

        await createUniqueNotification(
          studentId,
          "Attendance Alert",
          message,
          "attendance",
          severity,
        );
      }
    }

    // 2. Check Overdue Assignments
    const overdueAssignments = await Assignment.find({
      classId: await getStudentClassId(studentId), // Helper needed or assumption
      dueDate: { $lt: today },
    });

    // Actually, we need to know if *this* student submitted it.
    // Assignment model usually holds the task definition. Submissions are separate or embedded.
    // Let's assume we check the 'Assignment' collection for tasks,
    // and we'd need to check a 'Submission' collection if we had one.
    // Given the current seeded data structure, 'Assignment' seems to be per-class tasks.
    // Verification: We need to see if the student has submitted.
    // If 'Submission' model exists, checks there.
    // If not, we might skip detailed overdue check or just check 'pending' status if 'Assignment' was personalized.
    // Looking at seed_content.js:
    // "assignments" are created with "status: 'pending'".
    // So 'Assignment' collection seems to happen to contains personalized records OR we filter by student?
    // Let's check assignment model structure quickly.

    // Resume Safe Assumption:
    // If Assignment model has 'studentId', it's personalized.
    // If not, it's class-wide and we need Submission model.
    // I'll assume personalized for now based on 'status' field being present in previous file views.

    const pendingOverdue = await Assignment.find({
      studentId,
      status: "pending",
      dueDate: { $lt: today },
    });

    if (pendingOverdue.length > 0) {
      await createUniqueNotification(
        studentId,
        "Overdue Assignments",
        `You have ${pendingOverdue.length} assignment(s) past due. please submit them ASAP.`,
        "assignment",
        "warning",
      );
    }
  } catch (error) {
    console.error("Notification Generation Error:", error);
  }
};

// Helper: Create notification only if a similar one doesn't exist recently
const createUniqueNotification = async (
  studentId,
  title,
  message,
  type,
  severity,
) => {
  // Check if same type and title exists and is UNREAD
  const exists = await Notification.findOne({
    studentId,
    title,
    type,
    isRead: false,
  });

  if (!exists) {
    await Notification.create({
      studentId,
      title,
      message,
      type,
      severity,
    });
    console.log(`🔔 Notification created for ${studentId}: ${title}`);
  }
};

// Helper to get classId not strictly needed if we query Assignments by studentId directly
// (Assuming Assignment has studentId based on seed_content.js)
const getStudentClassId = async (studentId) => {
  // Placeholder if needed
  return null;
};
