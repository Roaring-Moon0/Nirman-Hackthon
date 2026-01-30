import mongoose from "mongoose";
import dotenv from "dotenv";
import { Student } from "./models/student.model.js";
import { Teacher } from "./models/teacher.model.js";
import { Subject } from "./models/Subject.model.js";
import { Class } from "./models/Class.model.js";
import { Assignment } from "./models/Assignment.js";
import { Notes } from "./models/Notes.js";
import { Attendance } from "./models/Attendance.js";
import { Marks } from "./models/Marks.js";
import { Roadmap } from "./models/Roadmap.js";

dotenv.config();

const seedContent = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/nirman_hackathon",
    );
    console.log("✅ DB Connected for Content Seeding");

    // 1. Fetch Entities
    const student = await Student.findOne({ rollNo: "CSE21A001" }); // Rahul
    const teacher = await Teacher.findOne({ employeeId: "EMP101" }); // Dr. Anil
    const cls = await Class.findOne({ classCode: "CSE-2A" });
    const subDS = await Subject.findOne({ subjectCode: "CS201" }); // Data Structures
    const subOS = await Subject.findOne({ subjectCode: "CS202" }); // OS

    if (!student || !teacher || !cls || !subDS) {
      console.error("❌ Base entities missing! Run seed_provided.js first.");
      process.exit(1);
    }

    console.log(`Found Student: ${student.name}, Class: ${cls.classCode}`);

    // 2. Clear Content Collections
    await Assignment.deleteMany({});
    await Notes.deleteMany({});
    await Attendance.deleteMany({});
    await Marks.deleteMany({});
    await Roadmap.deleteMany({});
    console.log("🧹 Cleared old content");

    // 3. Create Assignments
    const assignments = [
      {
        title: "Binary Trees Implementation",
        description: "Implement BST insertion and deletion in C++.",
        classId: cls._id,
        subjectId: subDS._id,
        teacherId: teacher._id,
        dueDate: new Date(Date.now() + 86400000 * 5), // Due in 5 days
        isActive: true,
        fileName: "BST_Requirements.pdf",
        filePath: "uploads/dummy_bst.pdf",
      },
      {
        title: "AVL Trees Research",
        description: "Write a report on AVL tree balancing rotations.",
        classId: cls._id,
        subjectId: subDS._id,
        teacherId: teacher._id,
        dueDate: new Date(Date.now() - 86400000 * 2), // Overdue (2 days ago)
        isActive: true,
        fileName: "AVL_Guide.pdf",
        filePath: "uploads/dummy_avl.pdf",
      },
      {
        title: "Process Scheduling Algorithms",
        description: "Solve the attached numericals for FCFS and SJF.",
        classId: cls._id,
        subjectId: subOS._id,
        teacherId: teacher._id,
        dueDate: new Date(Date.now() + 86400000 * 10), // Due in 10 days
        isActive: true,
        fileName: "Scheduling.pdf",
        filePath: "uploads/dummy_os.pdf",
      },
    ];
    await Assignment.insertMany(assignments);
    console.log("✅ Assignments seeded");

    // 4. Create Notes
    const notes = [
      {
        title: "Unit 3: Graph Theory Lecture Notes",
        description: "Handwritten notes from Monday's lecture.",
        classId: cls._id,
        subjectId: subDS._id,
        teacherId: teacher._id,
        fileName: "Graph_Theory_Unit3.pdf",
        filePath: "uploads/graph_notes.pdf",
        isActive: true,
      },
      {
        title: "OS Memory Management Slides",
        description: "PPT slides covering Paging and Segmentation.",
        classId: cls._id,
        subjectId: subOS._id,
        teacherId: teacher._id,
        fileName: "OS_Memory_Mgmt.pptx",
        filePath: "uploads/os_slides.pptx",
        isActive: true,
      },
    ];
    await Notes.insertMany(notes);
    console.log("✅ Notes seeded");

    // 5. Create Attendance (Backdate 10 days)
    const attendanceRecords = [];
    const dummyTimetableId = new mongoose.Types.ObjectId(); // Fake ID to satisfy schema

    for (let i = 0; i < 10; i++) {
      // DS Class
      attendanceRecords.push({
        studentId: student._id,
        classId: cls._id,
        subjectId: subDS._id,
        teacherId: teacher._id,
        timetableId: dummyTimetableId,
        date: new Date(Date.now() - 86400000 * (i + 1)),
        isPresent: i % 4 !== 0,
      });
      // OS Class (always present)
      attendanceRecords.push({
        studentId: student._id,
        classId: cls._id,
        subjectId: subOS._id,
        teacherId: teacher._id,
        timetableId: dummyTimetableId,
        date: new Date(Date.now() - 86400000 * (i + 1)),
        isPresent: true,
      });
    }
    await Attendance.insertMany(attendanceRecords);
    console.log("✅ Attendance seeded");

    // 6. Create Marks
    const marks = [
      {
        studentId: student._id,
        classId: cls._id,
        subjectId: subDS._id,
        teacherId: teacher._id,
        examName: "Mid-Term",
        obtainedMarks: 35,
        totalMarks: 50,
        percentage: 70,
        examDate: new Date("2024-03-15"),
      },
      {
        studentId: student._id,
        classId: cls._id,
        subjectId: subDS._id,
        teacherId: teacher._id,
        examName: "Unit Test 1",
        obtainedMarks: 18,
        totalMarks: 20,
        percentage: 90,
        examDate: new Date("2024-02-10"),
      },
      {
        studentId: student._id,
        classId: cls._id,
        subjectId: subOS._id,
        teacherId: teacher._id,
        examName: "Mid-Term",
        obtainedMarks: 42,
        totalMarks: 50,
        percentage: 84,
        examDate: new Date("2024-03-16"),
      },
    ];
    await Marks.insertMany(marks);
    console.log("✅ Marks seeded");

    console.log("🎉 FULL CONTENT SEEDING COMPLETE!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Content Seeding Failed:", error);
    process.exit(1);
  }
};

seedContent();
