import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: false, // Changed to false for Daily Class Attendance
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
      required: false, // Changed to false for Daily Class Attendance
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },
    isPresent: {
      type: Boolean,
      required: false, // Deprecating in favor of status enum, but keeping for compatibility if needed. Will sync them.
    },
    consecutiveAbsenceStreak: {
      type: Number,
      default: 0,
    },
    isOverridden: {
      type: Boolean,
      default: false,
    },
    overrideReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Ensure unique attendance record per student-class-date (ignoring subject for daily attendance)
// We drop the old index and add a new sparse one if needed, or just handle logic in controller.
// Ideally, if subjectId is missing, unique on (studentId, classId, date).
attendanceSchema.index({ studentId: 1, classId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
