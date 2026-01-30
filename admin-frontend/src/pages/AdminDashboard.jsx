import React, { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import axiosInstance from "../api/axios";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="stat-card">
    <div className="stat-info">
      <p>{title}</p>
      <h3>{value}</h3>
      {trend && (
        <p className="trend">
          <ArrowUpRight size={14} />
          {trend}
        </p>
      )}
    </div>
    <div className={`stat-icon-wrapper ${color.replace("bg-", "bg-")}`}>
      <Icon size={28} />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    studentCount: 0,
    teacherCount: 0,
    classCount: 0,
    subjectCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <p className="dashboard-subtitle">
          Welcome back, Admin. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={stats.studentCount}
          icon={GraduationCap}
          color="bg-blue"
          trend="+12% this month"
        />
        <StatCard
          title="Active Teachers"
          value={stats.teacherCount}
          icon={Users}
          color="bg-emerald"
          trend="Stable"
        />
        <StatCard
          title="Total Classes"
          value={stats.classCount}
          icon={BookOpen}
          color="bg-purple"
          trend="All active"
        />
        <StatCard
          title="Total Subjects"
          value={stats.subjectCount}
          icon={Activity}
          color="bg-amber"
          trend="Curriculum updated"
        />
      </div>

      {/* Quick Actions Section */}
      <div className="actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="actions-grid">
          <a href="/students" className="action-btn">
            <GraduationCap size={24} className="text-blue" />
            <span>Add Student</span>
          </a>
          <a href="/teachers" className="action-btn">
            <Users size={24} className="text-emerald" />
            <span>Add Teacher</span>
          </a>
          <a href="/classes" className="action-btn">
            <BookOpen size={24} className="text-purple" />
            <span>Create Class</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
