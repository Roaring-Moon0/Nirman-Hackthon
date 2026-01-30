import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { Bell, Check, X, AlertTriangle, Info, AlertCircle } from "lucide-react";

const NotificationBell = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Only render for students
  if (user?.role !== "student") return null;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/student/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();

    // Optional: Poll every 60s
    const interval = setInterval(() => {
      if (token) fetchNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await axios.patch(
        `${API_BASE_URL}/api/student/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await axios.patch(
        `${API_BASE_URL}/api/student/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  const getIcon = (type, severity) => {
    if (severity === "critical")
      return <AlertTriangle size={18} className="text-red-500" />;
    if (type === "risk")
      return <AlertCircle size={18} className="text-orange-500" />;
    if (type === "performance")
      return <AlertTriangle size={18} className="text-yellow-500" />;
    return <Info size={18} className="text-blue-500" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${!n.isRead ? "bg-blue-50/30" : ""}`}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                >
                  <div
                    className={`mt-1 flex-shrink-0 ${n.severity === "critical" ? "animate-pulse" : ""}`}
                  >
                    {getIcon(n.type, n.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${!n.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(n.createdAt).toLocaleDateString()} •{" "}
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  You're all caught up! 🎉
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  No new alerts right now.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
