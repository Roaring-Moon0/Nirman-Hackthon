import React from "react";
import { Menu, Search, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 h-16 px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu size={24} className="text-gray-600" />
        </button>

        {/* Search Bar - hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 w-64 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-600 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <NotificationBell />

        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">
              {user?.name || user?.role || "Guest"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role === "student"
                ? user?.className || "Student"
                : user?.role || "User"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
