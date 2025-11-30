import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx"
import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/authentication/Login.jsx";
import Signup from "./pages/authentication/Signup.jsx";

import ProductCatalog from "./pages/products/ProductCatalog.jsx";
import ProductDetails from "./pages/products/ProductDetails.jsx";

import Profile from "./pages/customer/Profile.jsx";
import Review from "./pages/customer/Review.jsx";
import Payment from "./pages/customer/Payment.jsx";
import CartPage from "./pages/customer/CartPage.jsx";  
import Checkout from "./pages/customer/Checkout.jsx";
import Orders from "./pages/customer/Orders.jsx";
import Notifications from "./pages/customer/Notifications.jsx";
import Wishlist from "./pages/customer/Wishlist.jsx"; 

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminManage from "./pages/admin/Manage.jsx";

const RequireAdmin = ({ children }) => {
  const role = localStorage.getItem("role");
  if (role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RequireCustomer = ({ children }) => {
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  // Block admins from customer pages
  if (role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Require a logged-in customer
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Customer session + idle timeout guard (3 minutes)
const CUSTOMER_IDLE_TIMEOUT = 3 * 60 * 1000; // 3 minutes in ms

const CustomerSessionGuard = ({ children }) => {
  const navigate = useLocation().pathname; // placeholder to force re-render on route change

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    // Only track idle for logged-in customers (not admins, not guests)
    if (role === "ADMIN" || !userId) {
      return;
    }

    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        // Auto-logout after inactivity
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }, CUSTOMER_IDLE_TIMEOUT);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    // Start initial timer
    resetTimer();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [navigate]);

  return children;
};

const RouteGuard = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || "";
    const role = localStorage.getItem("role");

    // If an admin navigates away from any /admin route, clear admin role
    if (role === "ADMIN" && !path.startsWith("/admin")) {
      localStorage.removeItem("role");
    }
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/catalog" element={<ProductCatalog />} />
      <Route path="/product/:id" element={<ProductDetails />} />

      {/* Customer Pages (Customer-only) */}
      <Route
        path="/profile"
        element={
          <RequireCustomer>
            <CustomerSessionGuard>
              <Profile />
            </CustomerSessionGuard>
          </RequireCustomer>
        }
      />
      <Route
        path="/orders"
        element={
          <RequireCustomer>
            <CustomerSessionGuard>
              <Orders />
            </CustomerSessionGuard>
          </RequireCustomer>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireCustomer>
            <CustomerSessionGuard>
              <Notifications />
            </CustomerSessionGuard>
          </RequireCustomer>
        }
      />
      <Route
        path="/wishlist"
        element={
          <RequireCustomer>
            <CustomerSessionGuard>
              <Wishlist />
            </CustomerSessionGuard>
          </RequireCustomer>
        }
      />
      <Route
        path="/review"
        element={
          <RequireCustomer>
            <CustomerSessionGuard>
              <Review />
            </CustomerSessionGuard>
          </RequireCustomer>
        }
      />
      <Route
        path="/payment"
        element={
          <RequireCustomer>
            <CustomerSessionGuard>
              <Payment />
            </CustomerSessionGuard>
          </RequireCustomer>
        }
      />
      <Route
        path="/cart"
        element={
          <RequireCustomer>
            <CustomerSessionGuard>
              <CartPage />
            </CustomerSessionGuard>
          </RequireCustomer>
        }
      />   
      <Route
        path="/checkout"
        element={
          <RequireCustomer>
            <CustomerSessionGuard>
              <Checkout />
            </CustomerSessionGuard>
          </RequireCustomer>
        }
      />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Pages (Protected) */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminManage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <AdminUsers />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/products"
        element={
          <RequireAdmin>
            <AdminManage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <RequireAdmin>
            <AdminManage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RequireAdmin>
            <AdminManage />
          </RequireAdmin>
        }
      />
    </Routes>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RouteGuard />
    </BrowserRouter>
  </React.StrictMode>
);