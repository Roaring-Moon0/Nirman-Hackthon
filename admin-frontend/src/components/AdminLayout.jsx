import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
