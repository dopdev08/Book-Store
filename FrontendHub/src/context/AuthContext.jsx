// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("authUser"));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser); // {id, username, email, roles}
  // JWT không có tiền tố "Bearer"; các file trong api/ đọc key "token" này
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = (userData, jwtToken) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("authUser", JSON.stringify(userData));
    setUser(userData);
    setToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    setUser(null);
    setToken(null);
  };

  const isAdmin = !!token && !!user?.roles?.includes("ROLE_ADMIN");

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
