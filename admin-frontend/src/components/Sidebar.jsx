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
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const Sidebar = () => {
  const { logoutAdmin } = useAdminAuth();

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logoutAdmin();
      // Navigation handled by App state change
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Students", path: "/students", icon: <GraduationCap size={20} /> },
    { name: "Teachers", path: "/teachers", icon: <Users size={20} /> },
    { name: "Classes", path: "/classes", icon: <BookOpen size={20} /> },
    { name: "Timetable", path: "/timetable", icon: <Calendar size={20} /> },
    {
      name: "Attendance",
      path: "/attendance",
      icon: <ClipboardCheck size={20} />,
    },
    { name: "Analytics", path: "/analytics", icon: <BarChart2 size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Nirman Admin</h2>
        <p
          style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}
        >
          Control Center
        </p>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "1rem 0" }}>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                {item.icon}
                <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  {item.name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ padding: "1rem", borderTop: "1px solid #334155" }}>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ width: "100%", color: "#f87171" }}
        >
          <LogOut size={20} />
          <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
