import mongoose from "mongoose";

const selfDeclarationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Academic Struggle",
        "Personal Issue",
        "Workload Pressure",
        "Other",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

export const SelfDeclaration = mongoose.model(
  "SelfDeclaration",
  selfDeclarationSchema,
);
