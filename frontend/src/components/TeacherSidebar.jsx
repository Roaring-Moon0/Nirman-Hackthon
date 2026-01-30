import React from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Use NavLink for active state
import { 
    LayoutDashboard, 
    Users,
    UserCheck, 
    FileText, 
    BarChart2, 
    LogOut, 
    X,
    School
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TeacherSidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/teacher/students", label: "My Students", icon: Users },
    { path: "/teacher/attendance", label: "Attendance", icon: UserCheck },
    { path: "/teacher/assignments", label: "Assignments", icon: FileText },
    { path: "/teacher/analytics", label: "Analytics", icon: BarChart2 },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden glass-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } shadow-2xl lg:shadow-none flex flex-col h-full`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-purple-600">
            <School size={28} />
            <span className="font-bold text-xl tracking-tight">Academia</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-purple-50 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium text-left"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
        
        {/* Footer */}
        <div className="p-4 text-center">
            <p className="text-xs text-gray-400">Teacher Portal v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default TeacherSidebar;
