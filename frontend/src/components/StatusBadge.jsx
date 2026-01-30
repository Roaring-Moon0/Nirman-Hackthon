import React from "react";

const StatusBadge = ({ status, type = "default" }) => {
  const getStyles = () => {
    // Attendance Status
    if (type === "attendance") {
      if (status === "Present") return "bg-green-100 text-green-700";
      if (status === "Absent") return "bg-red-100 text-red-700";
      return "bg-gray-100 text-gray-700";
    }

    switch (status?.toLowerCase()) {
      case "submitted":
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "overdue":
      case "late":
      case "submitted_late":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent capitalize ${getStyles()}`}
    >
      {status?.replace("_", " ") || "Unknown"}
    </span>
  );
};

export default StatusBadge;
