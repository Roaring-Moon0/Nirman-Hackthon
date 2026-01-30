import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    loginId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Settings Module Fields
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined to not conflict
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false, // Do not return by default
    },
    otpExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
