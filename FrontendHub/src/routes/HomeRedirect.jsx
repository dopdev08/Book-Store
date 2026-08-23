import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserHomePage from "../pages/UserHomePage";

function HomeRedirect() {
  const { isAdmin } = useAuth();

  // Admin vào "/" → về "/admin"
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // User thường → trang chủ bình thường
  return <UserHomePage />;
}

export default HomeRedirect;
