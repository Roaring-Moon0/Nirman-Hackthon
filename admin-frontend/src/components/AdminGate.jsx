import React, { useState } from "react";
// import { useNavigate } from "react-router-dom"; // Handled by PublicRoute/AuthContext auto-redirect or simple state change?
// Actually user said: "navigate('/admin/dashboard')" in point 5.
// Let's keep it explicit as requested.
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { API_ENDPOINTS } from "../utils/constants";
import { useAdminAuth } from "../context/AdminAuthContext";

const AdminGate = () => {
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[AdminGate] Form submitted. Key:", keyInput);

    setError("");
    setLoading(true);

    try {
      console.log("[AdminGate] Pinging API to validate key...");
      await axiosInstance.get(API_ENDPOINTS.ADMIN_PING, {
        headers: { "x-admin-key": keyInput },
      });
      console.log("[AdminGate] Ping successful.");

      // If successful:
      loginAdmin(keyInput);
      console.log("[AdminGate] loginAdmin called. Navigating to root...");
      navigate("/");
    } catch (err) {
      console.error("[AdminGate] Login failed:", err);
      setError("Invalid admin key. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-gate">
      <div className="admin-gate-card">
        <h1>🔐 Admin Access</h1>
        <p>Enter the admin key to access the admin panel</p>

        {error && <div className="message message-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Admin Key <span>*</span>
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter admin key"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !keyInput}
          >
            {loading ? "Validating..." : "Access Admin Panel"}
          </button>
        </form>

        <div className="info-box" style={{ marginTop: "20px" }}>
          <strong>Security Notice:</strong>
          This admin panel is protected by an admin key. Access is logged and
          monitored. Your session will expire when you close the browser.
        </div>
      </div>
    </div>
  );
};

export default AdminGate;
