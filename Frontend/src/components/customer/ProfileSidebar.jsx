import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

import homeImg from "../../assets/icons/sidebar/home.png";
import userImg from "../../assets/icons/sidebar/users.png";
import ordersImg from "../../assets/icons/sidebar/manage.png";
import logoutImg from "../../assets/icons/sidebar/logout.png";

// Bell icon for notifications
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

// Heart icon for wishlist
const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ProfileSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/notifications/customer/${userId}/unread-count`
        );
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    const fetchWishlistCount = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/wishlist/count`,
          {
            headers: {
              'userId': userId
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          setWishlistCount(data.count || 0);
        }
      } catch (err) {
        console.error("Error fetching wishlist count:", err);
      }
    };

    fetchUnread();
    fetchWishlistCount();
  }, [userId, location.pathname]);

  const handleLogout = (e) => {
    e.preventDefault();
    // Clear customer-related session data
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("guestCart");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo Link */}
      <Link to="/" className="logo-admin">
        <div className="logo-icon">PH</div>
        <span className="landing">Pinoy Heritage</span>
      </Link>

      <nav className="sidebar-menu">
        {/* Home Link */}
        <NavLink
          to="/home"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <span className="menu-icon">
            <img src={homeImg} alt="Home" className="icon-img" />
          </span>
          <span>Home</span>
        </NavLink>

        {/* Profile Link */}
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <span className="menu-icon">
            <img src={userImg} alt="Profile" className="icon-img" />
          </span>
          <span>Profile</span>
        </NavLink>

        {/* Orders Link */}
        <NavLink
          to="/orders"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <span className="menu-icon">
            <img src={ordersImg} alt="Orders" className="icon-img" />
          </span>
          <span>Orders</span>
        </NavLink>

        {/* Wishlist Link */}
        <NavLink
          to="/wishlist"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <span className="menu-icon wishlist-icon-wrapper">
            <HeartIcon />
            {wishlistCount > 0 && <span className="sidebar-wishlist-badge">{wishlistCount}</span>}
          </span>
          <span>Wishlist</span>
        </NavLink>

        {/* Notifications Link */}
        <NavLink
          to="/notifications"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <span className="menu-icon notif-icon-wrapper">
            <BellIcon />
            {unreadCount > 0 && <span className="sidebar-notif-badge">{unreadCount}</span>}
          </span>
          <span>Notifications</span>
        </NavLink>
      </nav>

      {/* Logout - match admin Link structure & style */}
      <Link to="/" className="menu-item logout-item" onClick={handleLogout}>
        <span className="menu-icon">
          <img src={logoutImg} alt="Logout" className="icon-img" />
        </span>
        <span>Logout</span>
      </Link>
    </aside>
  );
};

export default ProfileSidebar;