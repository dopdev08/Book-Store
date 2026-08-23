// src/App.jsx
import { Routes, Route } from "react-router-dom";
import MainNavbar from "./components/MainNavbar";

import UserHomePage from "./pages/UserHomePage";
import ComicDetailPage from "./pages/ComicDetailPage";
import CartPage from "./pages/CartPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import AdminComicsPage from "./pages/AdminComicsPage";
import AdminRoute from "./routes/AdminRoute";

import MyOrdersPage from "./pages/MyOrdersPage";     
import CheckoutPage from "./pages/CheckoutPage";     
import ProfilePage from "./pages/ProfilePage";       

import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

import PaymentPage from "./pages/PaymentPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";

import MyReviewsPage from "./pages/MyReviewsPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";

import AdminUsersPage from "./pages/AdminUsersPage";
import AdminUserOrdersPage from "./pages/AdminUserOrdersPage";

import AdminDiscountCodesPage from "./pages/AdminDiscountCodesPage";

import AdminReportsPage from "./pages/AdminReportsPage";
import HomeRedirect from "./routes/HomeRedirect";
import AdminPage from "./pages/AdminPage";


function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <MainNavbar />

        <Routes>
          {/* USER */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/comics/:id" element={<ComicDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} /> {/* thanh toán */}
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />   {/* lịch sử đơn */}
          <Route path="/my-reviews" element={<MyReviewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />   {/* hồ sơ */}

          {/* AUTH */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ADMIN */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/comics" element={<AdminComicsPage />} />
            <Route path="/admin/discount-codes" element={<AdminDiscountCodesPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route
              path="/admin/users/:id/orders"
              element={<AdminUserOrdersPage />}
            />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
