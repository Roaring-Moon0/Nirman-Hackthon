import mongoose from "mongoose";

const marksSchema = new mongoose.Schema(
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
    examName: {
      type: String,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      computed: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Calculate percentage before saving
marksSchema.pre("save", function (next) {
  this.percentage = (this.obtainedMarks / this.totalMarks) * 100;
  next();
});

// Ensure unique marks record per student-subject-exam
marksSchema.index({ studentId: 1, subjectId: 1, examName: 1 }, { unique: true });

export const Marks = mongoose.model("Marks", marksSchema);
