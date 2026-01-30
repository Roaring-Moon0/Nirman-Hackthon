export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const ENDPOINTS = {
  LOGIN: "/api/auth/login",
  STUDENT_DASHBOARD: "/api/student/dashboard",
  TEACHER_DASHBOARD: "/api/teacher/dashboard-comprehensive",
};
