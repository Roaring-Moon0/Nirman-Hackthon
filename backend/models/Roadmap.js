import mongoose from "mongoose";

const roadmapItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "Attendance Boost",
      "Assignment Completion",
      "Subject Focus",
      "Meeting",
    ],
    required: true,
  },
  isCompleted: { type: Boolean, default: false },
  dueDate: { type: Date },
  description: { type: String },
});

const roadmapSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    items: [roadmapItemSchema],
    lastGenerated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);
