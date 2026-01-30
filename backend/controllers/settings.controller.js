import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User.model.js";
import { Student } from "../models/student.model.js";
import { sendEmail } from "../services/emailService.js";

/**
 * Change Password
 * POST /api/student/settings/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(userId);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // Check if new password is same as old
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res
        .status(400)
        .json({ message: "New password cannot be the same as old password" });
    }

    // Hash and update
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};

/**
 * Request Email Update (Send OTP)
 * POST /api/student/settings/request-email-update
 */
export const requestEmailUpdate = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.userId;

    if (!newEmail || !newEmail.includes("@")) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Check if email already taken
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: "This email is already in use" });
    }

    const user = await User.findById(userId);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save to DB (hashed ideally, but plain for simple demo per requirements)
    // Actually, let's keep it simple for now as requested.
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Email
    const emailSent = await sendEmail(
      newEmail,
      "Your Email Verification Code",
      `<h3>Verify your new email</h3>
       <p>Your OTP code is: <strong>${otp}</strong></p>
       <p>It expires in 10 minutes.</p>`,
    );

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send verification email. Check server logs.",
      });
    }

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Request Email Error:", error);
    res.status(500).json({ message: "Failed to process email request" });
  }
};

/**
 * Verify Email OTP
 * POST /api/student/settings/verify-email-otp
 */
export const verifyEmailOtp = async (req, res) => {
  try {
    const { otp, newEmail } = req.body;
    const userId = req.user.userId;

    if (!otp || !newEmail) {
      return res.status(400).json({ message: "OTP and Email are required" });
    }

    const user = await User.findById(userId).select("+otp +otpExpires");

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Update Email
    user.email = newEmail;
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Email verified and updated successfully" });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

/**
 * Get User Settings
 * GET /api/student/settings
 */
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};
