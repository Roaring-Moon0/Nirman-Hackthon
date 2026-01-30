import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { User } from "./models/User.model.js";
import { Teacher } from "./models/teacher.model.js";
import { Student } from "./models/student.model.js";
import { Class } from "./models/class.model.js";
import { Subject } from "./models/subject.model.js";
import { Timetable } from "./models/Timetable.js";
import { Attendance } from "./models/Attendance.js"; // Note Capital A
import { Assignment } from "./models/Assignment.js"; // Note Capital A
import { Submission } from "./models/Submission.js"; // Note Capital S
import { Marks } from "./models/Marks.js"; // Note Capital M
import { ClassAssignment } from "./models/ClassAssignment.js";
import { TeacherAvailability } from "./models/TeacherAvailability.js";

// Load environment variables
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/hackathon_db";

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("📦 Connected to MongoDB for seeding...");

    const commonPassword = await bcrypt.hash("college@123", 10);

    // Helper to cast ID
    const oid = (id) => new mongoose.Types.ObjectId(id);

    // --- 1. USERS ---
    console.log("Creating Users...");
    try {
      const users = [
        {
          _id: oid("660000000000000000000001"),
          loginId: "TCH1001",
          password: commonPassword,
          role: "teacher",
          isActive: true,
        },
        {
          _id: oid("660000000000000000000002"),
          loginId: "CS21B001",
          password: commonPassword,
          role: "student",
          isActive: true,
        },
        {
          _id: oid("660000000000000000000003"),
          loginId: "CS21B002",
          password: commonPassword,
          role: "student",
          isActive: true,
        },
      ];

      for (const u of users) {
        await User.findByIdAndUpdate(u._id, u, { upsert: true });
      }
    } catch (e) {
      console.error("Error creating users:", e);
    }

    // --- 2. CLASS ---
    console.log("Creating Class...");
    try {
      const classes = [
        {
          _id: oid("662000000000000000000001"),
          classCode: "CSE-V-A",
          department: "Computer Science",
          course: "B.Tech",
          year: 3,
          section: "A",
        },
      ];

      for (const c of classes) {
        await Class.findByIdAndUpdate(c._id, c, { upsert: true });
      }
    } catch (e) {
      console.error("Error creating classes:", e);
    }

    // --- 3. SUBJECTS ---
    console.log("Creating Subjects...");
    try {
      const subjects = [
        {
          _id: oid("663000000000000000000001"),
          subjectCode: "CS301",
          subjectName: "Data Structures",
          semester: 5,
          department: "Computer Science",
        },
        {
          _id: oid("663000000000000000000002"),
          subjectCode: "CS302",
          subjectName: "Database Management",
          semester: 5,
          department: "Computer Science",
        },
      ];

      for (const s of subjects) {
        await Subject.findByIdAndUpdate(s._id, s, { upsert: true });
      }
    } catch (e) {
      console.error("Error creating subjects:", e);
    }

    // --- 4. TEACHERS ---
    console.log("Creating Teachers...");
    try {
      const teachers = [
        {
          _id: oid("661000000000000000000001"),
          userId: oid("660000000000000000000001"),
          employeeId: "TCH1001",
          name: "Anil Verma",
          department: "Computer Science",
          designation: "Assistant Professor",
        },
      ];

      for (const t of teachers) {
        await Teacher.findByIdAndUpdate(t._id, t, { upsert: true });
        await TeacherAvailability.findOneAndUpdate(
          { teacherId: t._id },
          { teacherId: t._id, status: "Available", location: "Staff Room A" },
          { upsert: true },
        );
      }
    } catch (e) {
      console.error("Error creating teachers:", e);
    }

    // --- 4.5 CLASS ASSIGNMENTS ---
    console.log("Assigning Classes to Teachers...");
    try {
      const classAssignments = [
        {
          teacherId: oid("661000000000000000000001"),
          classId: oid("662000000000000000000001"),
          subjectId: oid("663000000000000000000001"),
        },
        {
          teacherId: oid("661000000000000000000001"),
          classId: oid("662000000000000000000001"),
          subjectId: oid("663000000000000000000002"),
        },
      ];
      await ClassAssignment.deleteMany({});
      await ClassAssignment.insertMany(classAssignments);
    } catch (e) {
      console.error("Error assigning classes:", e);
    }

    // --- 5. STUDENTS ---
    console.log("Creating Students...");
    try {
      const students = [
        {
          _id: oid("664000000000000000000001"),
          userId: oid("660000000000000000000002"),
          rollNo: "CS21B001",
          name: "Rahul Mehta",
          classId: oid("662000000000000000000001"),
        },
        {
          _id: oid("664000000000000000000002"),
          userId: oid("660000000000000000000003"),
          rollNo: "Priya Sharma",
          name: "Priya Sharma",
          classId: oid("662000000000000000000001"),
        },
      ];

      for (const s of students) {
        await Student.findByIdAndUpdate(s._id, s, { upsert: true });
      }
    } catch (e) {
      console.error("Error creating students:", e);
    }

    // --- 6. TIMETABLE ---
    console.log("Creating Timetable (Critical for Dropdowns)...");
    try {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      const timetables = [];

      days.forEach((day) => {
        timetables.push({
          _id: day === "Mon" ? oid("665000000000000000000001") : undefined,
          classId: oid("662000000000000000000001"),
          subjectId: oid("663000000000000000000001"),
          teacherId: oid("661000000000000000000001"),
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "11:00",
          classType: "Lecture",
        });
      });

      await Timetable.deleteMany({});
      const createdTimetables = await Timetable.insertMany(timetables);
      console.log(`✅ Created ${createdTimetables.length} timetable entries.`);
    } catch (e) {
      console.error("❌ Error creating timetable:", e);
    }

    // --- 7. ATTENDANCE ---
    console.log("Creating Attendance...");
    try {
      const attendanceData = [
        {
          studentId: oid("664000000000000000000001"),
          classId: oid("662000000000000000000001"),
          subjectId: oid("663000000000000000000001"),
          teacherId: oid("661000000000000000000001"),
          timetableId: oid("665000000000000000000001"),
          date: new Date("2026-01-20"),
          isPresent: true,
        },
      ];
      await Attendance.deleteMany({});
      await Attendance.insertMany(attendanceData);
      console.log("✅ Attendance data seeded.");
    } catch (e) {
      console.error("❌ Attendance seeding error (skipping):", e.message);
    }

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding CRITICAL FAILURE:", error);
    process.exit(1);
  }
};

seedDatabase();
