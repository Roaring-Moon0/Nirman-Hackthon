import React, { createContext, useContext, useState, useEffect } from "react";
import { ADMIN_AUTH_SESSION_KEY, ADMIN_KEY_STORAGE } from "../utils/constants";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session on mount
    const authFlag = sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY);
    if (authFlag === "true") {
      setAdmin(true);
    } else {
      setAdmin(false);
    }
    setLoading(false);
  }, []);

  const loginAdmin = (key) => {
    sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, "true");
    sessionStorage.setItem(ADMIN_KEY_STORAGE, key); // Ensure key is stored for API calls
    setAdmin(true);
  };

  const logoutAdmin = () => {
    sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    setAdmin(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, loading, loginAdmin, logoutAdmin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
