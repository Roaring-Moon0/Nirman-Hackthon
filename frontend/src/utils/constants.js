// API Base URL
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// User Roles
export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
};

// API Endpoints (placeholders)
export const ENDPOINTS = {
  LOGIN: "/auth/login",
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    CLASSES: "/admin/classes",
    SUBJECTS: "/admin/subjects",
  },
  TEACHER: {
    DASHBOARD: "/teacher/dashboard",
    ASSIGNMENTS: "/teacher/assignments",
    ATTENDANCE: "/teacher/attendance",
    MARKS: "/teacher/marks",
  },
  STUDENT: {
    DASHBOARD: "/student/dashboard",
    ASSIGNMENTS: "/student/assignments",
    MARKS: "/student/marks",
    ATTENDANCE: "/student/attendance",
  },
};

// UI Constants
export const BUTTON_VARIANTS = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  DANGER: "danger",
  SUCCESS: "success",
};

export const BUTTON_SIZES = {
  SMALL: "sm",
  MEDIUM: "md",
  LARGE: "lg",
};
