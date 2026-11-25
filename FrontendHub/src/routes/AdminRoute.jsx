// src/routes/AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute() {
  const { isAdmin } = useAuth();

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}

export default AdminRoute;
