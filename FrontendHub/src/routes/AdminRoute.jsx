// src/routes/AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("userRoles") || "[]");

  const isAdmin = token && roles.includes("ROLE_ADMIN");

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}

export default AdminRoute;
