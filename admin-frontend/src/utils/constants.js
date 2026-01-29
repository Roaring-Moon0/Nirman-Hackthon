// API Base URL
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// SessionStorage key for admin key
export const ADMIN_KEY_STORAGE = "adminKey";

// API Endpoints
export const API_ENDPOINTS = {
  ADMIN_PING: "/admin/ping",
  ADD_CLASS: "/admin/class",
  ADD_SUBJECT: "/admin/subject",
  ADD_STUDENT: "/admin/student",
  ADD_TEACHER: "/admin/teacher",
};

// Form field definitions
export const FORM_FIELDS = {
  CLASS: [
    {
      name: "classCode",
      label: "Class Code",
      type: "text",
      required: true,
      placeholder: "e.g., CS-10-A",
    },
    {
      name: "department",
      label: "Department",
      type: "text",
      required: true,
      placeholder: "e.g., Computer Science",
    },
    {
      name: "course",
      label: "Course",
      type: "text",
      required: true,
      placeholder: "e.g., B.Tech",
    },
    {
      name: "year",
      label: "Year",
      type: "number",
      required: true,
      placeholder: "e.g., 2",
    },
    {
      name: "section",
      label: "Section",
      type: "text",
      required: true,
      placeholder: "e.g., A",
    },
  ],
  SUBJECT: [
    {
      name: "subjectCode",
      label: "Subject Code",
      type: "text",
      required: true,
      placeholder: "e.g., CS101",
    },
    {
      name: "subjectName",
      label: "Subject Name",
      type: "text",
      required: true,
      placeholder: "e.g., Data Structures",
    },
    {
      name: "semester",
      label: "Semester",
      type: "number",
      required: true,
      placeholder: "e.g., 3",
    },
    {
      name: "department",
      label: "Department",
      type: "text",
      required: true,
      placeholder: "e.g., Computer Science",
    },
  ],
  STUDENT: [
    {
      name: "rollNo",
      label: "Roll Number",
      type: "text",
      required: true,
      placeholder: "e.g., 2024001",
    },
    {
      name: "name",
      label: "Student Name",
      type: "text",
      required: true,
      placeholder: "e.g., John Doe",
    },
    {
      name: "classCode",
      label: "Class Code",
      type: "text",
      required: true,
      placeholder: "e.g., CS-10-A",
    },
  ],
  TEACHER: [
    {
      name: "employeeId",
      label: "Employee ID",
      type: "text",
      required: true,
      placeholder: "e.g., EMP001",
    },
    {
      name: "name",
      label: "Teacher Name",
      type: "text",
      required: true,
      placeholder: "e.g., Prof. Smith",
    },
    {
      name: "department",
      label: "Department",
      type: "text",
      required: true,
      placeholder: "e.g., Computer Science",
    },
    {
      name: "designation",
      label: "Designation",
      type: "text",
      required: true,
      placeholder: "e.g., Assistant Professor",
    },
  ],
};
