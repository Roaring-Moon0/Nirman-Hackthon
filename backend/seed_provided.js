import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.model.js";
import { Class } from "./models/Class.model.js";
import { Subject } from "./models/Subject.model.js";
import { Teacher } from "./models/teacher.model.js";
import { Student } from "./models/student.model.js";
import { ClassAssignment } from "./models/ClassAssignment.js";
import { Assignment } from "./models/Assignment.js"; // Needed if we want to add assignments? The JSON had classAssignments (mapping), not coursework assignments.

import bcrypt from "bcryptjs";
dotenv.config();

const data = {
  classes: [
    {
      _id: "64caa0011111111111111111",
      classCode: "CSE-2A",
      department: "Computer Science",
      course: "B.Tech",
      year: 2,
      section: "A",
    },
  ],
  subjects: [
    {
      _id: "64caa0021111111111111111",
      subjectCode: "CS201",
      subjectName: "Data Structures",
      semester: 3,
      department: "Computer Science",
    },
    {
      _id: "64caa0022222222222222222",
      subjectCode: "CS202",
      subjectName: "Operating Systems",
      semester: 3,
      department: "Computer Science",
    },
    {
      _id: "64caa0023333333333333333",
      subjectCode: "CS203",
      subjectName: "Database Management Systems",
      semester: 3,
      department: "Computer Science",
    },
  ],
  teachers: [
    {
      _id: "64caa0031111111111111111",
      userId: "64caa0041111111111111111",
      employeeId: "EMP101",
      name: "Dr. Anil Sharma",
      department: "Computer Science",
      email: "anil.sharma@college.edu",
    },
    {
      _id: "64caa0032222222222222222",
      userId: "64caa0042222222222222222",
      employeeId: "EMP102",
      name: "Prof. Neha Verma",
      department: "Computer Science",
      email: "neha.verma@college.edu",
    },
  ],
  students: [
    {
      _id: "64caa0051111111111111111",
      userId: "64caa0061111111111111111",
      rollNo: "CSE21A001",
      name: "Rahul Mehta",
      email: "rahul.mehta@student.edu",
      classId: "64caa0011111111111111111",
    },
    {
      _id: "64caa0052222222222222222",
      userId: "64caa0062222222222222222",
      rollNo: "CSE21A002",
      name: "Neha Sharma",
      email: "neha.sharma@student.edu",
      classId: "64caa0011111111111111111",
    },
    {
      _id: "64caa0053333333333333333",
      userId: "64caa0063333333333333333",
      rollNo: "CSE21A003",
      name: "Aman Gupta",
      email: "aman.gupta@student.edu",
      classId: "64caa0011111111111111111",
    },
  ],
  classAssignments: [
    {
      _id: "64caa0071111111111111111",
      classId: "64caa0011111111111111111",
      subjectId: "64caa0021111111111111111",
      teacherId: "64caa0031111111111111111",
    },
    {
      _id: "64caa0072222222222222222",
      classId: "64caa0011111111111111111",
      subjectId: "64caa0022222222222222222",
      teacherId: "64caa0032222222222222222",
    },
  ],
};

const seed = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/nirman_hackathon",
    );
    console.log("Connected to MongoDB for Seeding");

    // CLEAR EXISTING DATA to avoid unique index conflicts
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await User.deleteMany({}); // Warning: This deletes ALL users
    await ClassAssignment.deleteMany({});
    console.log("Existing data cleared.");

    // 1. Upsert Classes
    for (const cls of data.classes) {
      await Class.findByIdAndUpdate(cls._id, cls, { upsert: true, new: true });
    }
    console.log("Classes seeded.");

    // 2. Upsert Subjects
    for (const sub of data.subjects) {
      await Subject.findByIdAndUpdate(sub._id, sub, {
        upsert: true,
        new: true,
      });
    }
    console.log("Subjects seeded.");

    // 3. Upsert Users & Teachers
    for (const t of data.teachers) {
      // Create/Update User first
      const userPayload = {
        _id: t.userId,
        loginId: t.employeeId,
        password: bcrypt.hashSync("password123", 10), // Hashed password
        role: "teacher",
        name: t.name,
        email: t.email,
      };

      // We use findOneAndUpdate on _id if possible, or create
      let user = await User.findById(t.userId);
      if (!user) {
        user = await User.create(userPayload);
      } else {
        await User.findByIdAndUpdate(t.userId, userPayload);
      }

      // Upsert Teacher
      await Teacher.findByIdAndUpdate(
        t._id,
        {
          ...t,
          isActive: true,
        },
        { upsert: true, new: true },
      );
    }
    console.log("Teachers seeded.");

    // 4. Upsert Users & Students
    for (const s of data.students) {
      const userPayload = {
        _id: s.userId,
        loginId: s.rollNo, // Using Roll No as login
        password: bcrypt.hashSync("password123", 10),
        role: "student",
        name: s.name,
        email: s.email,
      };

      let user = await User.findById(s.userId);
      if (!user) {
        user = await User.create(userPayload);
      } else {
        await User.findByIdAndUpdate(s.userId, userPayload);
      }

      await Student.findByIdAndUpdate(
        s._id,
        {
          ...s,
          isActive: true,
        },
        { upsert: true, new: true },
      );
    }
    console.log("Students seeded.");

    // 5. Upsert ClassAssignments
    for (const ca of data.classAssignments) {
      await ClassAssignment.findByIdAndUpdate(ca._id, ca, {
        upsert: true,
        new: true,
      });
    }
    console.log("ClassAssignments seeded.");

    console.log("✅ Custom Data Seeded Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
