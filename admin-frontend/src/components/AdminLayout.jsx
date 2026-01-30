import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
