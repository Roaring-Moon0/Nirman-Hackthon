import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "./models/User.model.js";
import { Teacher } from "./models/teacher.model.js";
import { Student } from "./models/student.model.js";
import { Class } from "./models/class.model.js";
import { Subject } from "./models/subject.model.js";
import { ClassAssignment } from "./models/ClassAssignment.js";
import { Timetable } from "./models/Timetable.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Clean up existing data
    console.log("\n🗑️  Cleaning existing data...");
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await ClassAssignment.deleteMany({});
    await Timetable.deleteMany({});

    // Create password hash (same for all test users)
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create Classes
    console.log("\n📚 Creating classes...");
    const class1 = await Class.create({
      classCode: "CS-2024-A",
      department: "Computer Science",
      course: "B.Tech",
      year: 2,
      section: "A",
    });

    const class2 = await Class.create({
      classCode: "CS-2024-B",
      department: "Computer Science",
      course: "B.Tech",
      year: 2,
      section: "B",
    });

    console.log(`  ✓ Created: ${class1.classCode}, ${class2.classCode}`);

    // Create Subjects
    console.log("\n📖 Creating subjects...");
    const subject1 = await Subject.create({
      subjectCode: "CS201",
      subjectName: "Data Structures",
      semester: 3,
      department: "Computer Science",
    });

    const subject2 = await Subject.create({
      subjectCode: "CS202",
      subjectName: "Database Management",
      semester: 3,
      department: "Computer Science",
    });

    console.log(
      `  ✓ Created: ${subject1.subjectName}, ${subject2.subjectName}`,
    );

    // Create Teachers
    console.log("\n👨‍🏫 Creating teachers...");

    // Teacher 1
    const teacherUser1 = await User.create({
      loginId: "T001",
      password: hashedPassword,
      role: "teacher",
      isActive: true,
    });

    const teacher1 = await Teacher.create({
      userId: teacherUser1._id,
      employeeId: "T001",
      name: "Prof. John Smith",
      department: "Computer Science",
      designation: "Assistant Professor",
      isActive: true,
    });

    // Teacher 2
    const teacherUser2 = await User.create({
      loginId: "T002",
      password: hashedPassword,
      role: "teacher",
      isActive: true,
    });

    const teacher2 = await Teacher.create({
      userId: teacherUser2._id,
      employeeId: "T002",
      name: "Dr. Sarah Johnson",
      department: "Computer Science",
      designation: "Associate Professor",
      isActive: true,
    });

    console.log(
      `  ✓ Created: ${teacher1.name} (T001), ${teacher2.name} (T002)`,
    );
    console.log(`  🔑 Password for both: password123`);

    // Assign Teachers to Classes
    console.log("\n🔗 Assigning teachers to classes...");

    const assignment1 = await ClassAssignment.create({
      teacherId: teacher1._id,
      classId: class1._id,
      subjectId: subject1._id,
    });

    const assignment2 = await ClassAssignment.create({
      teacherId: teacher1._id,
      classId: class2._id,
      subjectId: subject2._id,
    });

    const assignment3 = await ClassAssignment.create({
      teacherId: teacher2._id,
      classId: class1._id,
      subjectId: subject2._id,
    });

    console.log(
      `  ✓ ${teacher1.name} → ${class1.classCode} (${subject1.subjectName})`,
    );
    console.log(
      `  ✓ ${teacher1.name} → ${class2.classCode} (${subject2.subjectName})`,
    );
    console.log(
      `  ✓ ${teacher2.name} → ${class1.classCode} (${subject2.subjectName})`,
    );

    // Create Students
    console.log("\n👨‍🎓 Creating students...");

    const students = [];

    // 3 students for Class A
    for (let i = 1; i <= 3; i++) {
      const rollNo = `S00${i}`;
      const studentUser = await User.create({
        loginId: rollNo,
        password: hashedPassword,
        role: "student",
        isActive: true,
      });

      const student = await Student.create({
        userId: studentUser._id,
        rollNo,
        name: `Student ${i}`,
        classId: class1._id,
        isActive: true,
      });

      students.push(student);
      console.log(`  ✓ Created: ${student.name} (${rollNo})`);
    }

    // 2 students for Class B
    for (let i = 4; i <= 5; i++) {
      const rollNo = `S00${i}`;
      const studentUser = await User.create({
        loginId: rollNo,
        password: hashedPassword,
        role: "student",
        isActive: true,
      });

      const student = await Student.create({
        userId: studentUser._id,
        rollNo,
        name: `Student ${i}`,
        classId: class2._id,
        isActive: true,
      });

      students.push(student);
      console.log(`  ✓ Created: ${student.name} (${rollNo})`);
    }

    console.log(`  🔑 Password for all students: password123`);

    // Create Sample Timetable
    console.log("\n📅 Creating timetable...");

    await Timetable.create({
      classId: class1._id,
      subjectId: subject1._id,
      teacherId: teacher1._id,
      dayOfWeek: "Mon",
      startTime: "09:00",
      endTime: "10:00",
      classType: "Lecture",
    });

    await Timetable.create({
      classId: class1._id,
      subjectId: subject1._id,
      teacherId: teacher1._id,
      dayOfWeek: "Wed",
      startTime: "11:00",
      endTime: "13:00",
      classType: "Lab",
    });

    await Timetable.create({
      classId: class1._id,
      subjectId: subject2._id,
      teacherId: teacher2._id,
      dayOfWeek: "Tue",
      startTime: "10:00",
      endTime: "11:00",
      classType: "Lecture",
    });

    console.log(`  ✓ Created timetable entries for ${class1.classCode}`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ SEED DATA CREATED SUCCESSFULLY");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log(`  • Classes: 2 (${class1.classCode}, ${class2.classCode})`);
    console.log(
      `  • Subjects: 2 (${subject1.subjectCode}, ${subject2.subjectCode})`,
    );
    console.log(`  • Teachers: 2 (T001, T002)`);
    console.log(`  • Students: 5 (S001-S005)`);
    console.log(`  • Timetable entries: 3`);
    console.log(`\n🔑 Login Credentials:`);
    console.log(`  • Teacher: T001 / password123`);
    console.log(`  • Teacher: T002 / password123`);
    console.log(`  • Students: S001-S005 / password123`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
