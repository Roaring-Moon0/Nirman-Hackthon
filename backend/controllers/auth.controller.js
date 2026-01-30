import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";

export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ loginId });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let profile = null;

    if (user.role === "student") {
      profile = await Student.findOne({ userId: user._id }).populate("classId");
    }

    if (user.role === "teacher") {
      profile = await Teacher.findOne({ userId: user._id });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      role: user.role,
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
