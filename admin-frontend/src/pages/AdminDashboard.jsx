import React, { useState, useEffect } from "react";
import { Users, GraduationCap, BookOpen, Zap } from "lucide-react";
import axiosInstance from "../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [users, classes, subjects] = await Promise.all([
        axiosInstance.get("/admin/users"),
        axiosInstance.get("/admin/classes"),
        axiosInstance.get("/admin/subjects"),
      ]);

      const students = users.data.filter((u) => u.role === "student");
      const teachers = users.data.filter((u) => u.role === "teacher");

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.data.length,
        totalSubjects: subjects.data.length,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      color: "#3b82f6",
    },
    {
      title: "Active Teachers",
      value: stats.totalTeachers,
      icon: Users,
      color: "#10b981",
    },
    {
      title: "Total Classes",
      value: stats.totalClasses,
      icon: BookOpen,
      color: "#8b5cf6",
    },
    {
      title: "Total Subjects",
      value: stats.totalSubjects,
      icon: Zap,
      color: "#f59e0b",
    },
  ];

  return (
    <div style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "8px",
          }}
        >
          Dashboard Overview
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          Welcome back, Admin. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {statCards.map((stat) => (
          <div
            key={stat.title}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  {stat.title}
                </p>
                <p
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  {stat.value ?? 0}
                </p>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: stat.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <stat.icon size={24} color="white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#0f172a",
            marginBottom: "16px",
          }}
        >
          Quick Actions
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
          }}
        >
          <button
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f1f5f9")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#f8fafc")}
          >
            <GraduationCap
              size={32}
              color="#3b82f6"
              style={{ marginBottom: "8px" }}
            />
            <span
              style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}
            >
              Add Student
            </span>
          </button>
          <button
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f1f5f9")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#f8fafc")}
          >
            <Users size={32} color="#10b981" style={{ marginBottom: "8px" }} />
            <span
              style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}
            >
              Add Teacher
            </span>
          </button>
          <button
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f1f5f9")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#f8fafc")}
          >
            <BookOpen
              size={32}
              color="#8b5cf6"
              style={{ marginBottom: "8px" }}
            />
            <span
              style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}
            >
              Create Class
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
