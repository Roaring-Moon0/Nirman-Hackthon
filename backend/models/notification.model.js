import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["attendance", "assignment", "performance", "risk", "general"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Notification = mongoose.model("Notification", notificationSchema);
