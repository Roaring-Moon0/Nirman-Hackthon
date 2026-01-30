import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import AdminGate from "./components/AdminGate";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import StudentsPage from "./pages/Students";
import TeachersPage from "./pages/Teachers";
import ClassesPage from "./pages/Classes";
import AnalyticsPage from "./pages/Analytics";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";

// Protected Route Component
const ProtectedRoute = () => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    ); // Or a spinner
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const PublicRoute = () => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return null;
  }

  if (admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<AdminGate />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;
