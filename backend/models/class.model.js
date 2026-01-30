import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    classCode: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    section: {
      type: String,
      required: true,
    },
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for formatted class name
classSchema.virtual("name").get(function () {
  return `${this.course} ${this.department} - ${this.year} Year - Sec ${this.section}`;
});

export const Class = mongoose.model("Class", classSchema);
