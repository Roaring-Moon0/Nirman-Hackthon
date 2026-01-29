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
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    isPresent: {
      type: Boolean,
      required: true,
    },
    consecutiveAbsenceStreak: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Ensure unique attendance record per student-class-subject-timetable-date
attendanceSchema.index(
  { studentId: 1, classId: 1, subjectId: 1, timetableId: 1, date: 1 },
  { unique: true }
);

export const Attendance = mongoose.model("Attendance", attendanceSchema);
