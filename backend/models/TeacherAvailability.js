import mongoose from "mongoose";

const teacherAvailabilitySchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Available", "In Class", "Busy", "Away"],
      default: "Available",
    },
    location: {
      type: String,
      default: "",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const TeacherAvailability = mongoose.model(
  "TeacherAvailability",
  teacherAvailabilitySchema,
);
