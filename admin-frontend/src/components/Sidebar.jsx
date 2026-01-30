import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  BarChart2,
  Settings,
  LogOut,
  Link,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const Sidebar = () => {
  const { logoutAdmin } = useAdminAuth();

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logoutAdmin();
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Students", path: "/students", icon: GraduationCap },
    { name: "Teachers", path: "/teachers", icon: Users },
    { name: "Classes", path: "/classes", icon: BookOpen },
    { name: "Assignments", path: "/assignments", icon: Link },
    { name: "Timetable", path: "/timetable", icon: Calendar },
    { name: "Attendance", path: "/attendance", icon: ClipboardCheck },
    { name: "Analytics", path: "/analytics", icon: BarChart2 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside
      style={{
        width: "256px",
        minWidth: "256px",
        height: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1e293b",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "white",
            margin: 0,
          }}
        >
          Nirman Admin
        </h2>
        <p
          style={{
            fontSize: "11px",
            color: "#94a3b8",
            marginTop: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Control Center
        </p>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 0",
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 24px",
              color: isActive ? "white" : "#94a3b8",
              backgroundColor: isActive ? "#2563eb" : "transparent",
              borderLeft: isActive
                ? "4px solid #3b82f6"
                : "4px solid transparent",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
            })}
            className="sidebar-nav-item"
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #1e293b",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "12px 24px",
            backgroundColor: "transparent",
            color: "#f87171",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1e293b")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
