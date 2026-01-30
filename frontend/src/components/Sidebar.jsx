import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  StickyNote,
  LogOut,
  Menu,
  X,
  Settings,
  AlertTriangle,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
    { icon: CalendarCheck, label: "Attendance", path: "/student/attendance" },
    { icon: BookOpen, label: "Assignments", path: "/student/assignments" },
    { icon: GraduationCap, label: "Marks", path: "/student/marks" },
    { icon: StickyNote, label: "Notes", path: "/student/notes" },
    { icon: Users, label: "Teachers", path: "/student/teachers" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-white bg-blue-600">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <GraduationCap size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Academic ERP</h1>
          <p className="text-xs text-blue-200">Student Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-white text-blue-600 shadow-lg font-semibold"
                  : "text-blue-100 hover:bg-blue-500 hover:text-white"
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-blue-500 space-y-2">
        <button
          onClick={() => navigate("/student/settings")}
          className="flex items-center gap-3 px-4 py-3 w-full text-blue-100 hover:bg-blue-500 rounded-xl transition-colors"
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-100 hover:bg-red-500/20 hover:text-white rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-600 shadow-2xl transition-transform duration-300 transform lg:translate-x-0 lg:static lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
