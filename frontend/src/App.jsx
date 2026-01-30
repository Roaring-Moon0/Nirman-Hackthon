import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import StudentLayout from './layouts/StudentLayout';

// Student Pages
import Dashboard from './pages/student/Dashboard';
import Assignments from './pages/student/Assignments';
import Attendance from './pages/student/Attendance';
import Marks from './pages/student/Marks';
import Notes from './pages/student/Notes';
import Settings from './pages/student/Settings';
import Teachers from './pages/student/Teachers';

// Teacher Pages
import TeacherLayout from './layouts/TeacherLayout';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherAssignments from './pages/teacher/Assignments';

import TeacherAnalytics from './pages/teacher/Analytics';
import TeacherStudents from './pages/teacher/Students';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Login Route (redirect if already logged in)
const LoginRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    if (user.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          
          {/* Student Routes - Nested in Layout */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="marks" element={<Marks />} />
            <Route path="notes" element={<Notes />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Teacher Routes - Nested in Layout */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="analytics" element={<TeacherAnalytics />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
