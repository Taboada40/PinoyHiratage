import "../styles/header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// SVG Icons
const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const OrdersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const WishlistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const NotificationsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const AdminIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 15l-8-4V6l8 4 8-4v5l-8 4z"/>
    <path d="M12 15v6"/>
    <path d="M4 11l8 4"/>
    <path d="M12 19l8-4"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

function Header({ showNav = true }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Detect if we're on the primary landing page (only '/')
  const isLandingPage = location.pathname === "/";

  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if user is logged in and fetch data
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (userId) {
      setUser({
        id: userId,
        username,
        email,
        role
      });
      fetchUserData(userId);
    } else {
      setUser(null);
      setUnreadCount(0);
      setWishlistCount(0);
    }
  }, [location.pathname]);

  const fetchUserData = async (userId) => {
    // Fetch unread notifications
    try {
      const res = await fetch(
        `http://localhost:8080/api/notifications/customer/${userId}/unread-count`
      );
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (err) {
      console.error("Error fetching unread notifications", err);
    }

    // Fetch wishlist count
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
      console.error("Error fetching wishlist count", err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine header style
  const headerClass = `header ${
    isLandingPage
      ? isScrolled
        ? "header--scrolled"
        : "header--transparent"
      : ""
  }`;

  const handleAccountClick = () => {
    if (user) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("guestCart");
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  return (
    <header className={headerClass}>
      <div className="container">
        <div className="nav-content">
          <div className="logo">
            <div className="logo-icon">PH</div>
            <Link to="/" className="nav-link">PinoyHeritage</Link>
          </div>

          {showNav && (
            <nav className="nav-menu">
              <Link to="/home" className="nav-link">Home</Link>
              <a href="#why-section" className="nav-link">About</a>
              <Link to="/catalog" className="nav-link">Shop</Link>
            </nav>
          )}

          <div className="nav-icons">
            <button className="search-btn" aria-label="Search"></button>
            
            {/* Cart button navigates to /cart */}
            <button 
              className="cart-btn" 
              aria-label="Cart" 
              onClick={() => navigate("/cart")}
            ></button>
            
            <div className="profile-dropdown">
              <button
                className="acc-btn"
                aria-label="Account"
                onClick={handleAccountClick}
              >
                {(unreadCount > 0 || wishlistCount > 0) && (
                  <span className="notification-dot"></span>
                )}
              </button>

              {/* Dropdown Menu - Only shows when user is logged in */}
              {isDropdownOpen && user && (
                <div className="dropdown-menu">
                  {/* User Info */}
                  <div className="dropdown-header">
                    <div className="user-avatar">
                      {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.username || 'User'}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  {/* Menu Items */}
                  <button 
                    className="dropdown-item"
                    onClick={() => handleNavigation("/profile")}
                  >
                    <span className="dropdown-icon">
                      <ProfileIcon />
                    </span>
                    Profile
                  </button>

                  <button 
                    className="dropdown-item"
                    onClick={() => handleNavigation("/orders")}
                  >
                    <span className="dropdown-icon">
                      <OrdersIcon />
                    </span>
                    My Orders
                  </button>

                  <button 
                    className="dropdown-item"
                    onClick={() => handleNavigation("/wishlist")}
                  >
                    <span className="dropdown-icon">
                      <WishlistIcon />
                      {wishlistCount > 0 && (
                        <span className="dropdown-badge">{wishlistCount}</span>
                      )}
                    </span>
                    Wishlist
                  </button>

                  <button 
                    className="dropdown-item"
                    onClick={() => handleNavigation("/notifications")}
                  >
                    <span className="dropdown-icon">
                      <NotificationsIcon />
                      {unreadCount > 0 && (
                        <span className="dropdown-badge">{unreadCount}</span>
                      )}
                    </span>
                    Notifications
                  </button>

                  <div className="dropdown-divider"></div>

                  {/* Admin Dashboard Link (if admin) */}
                  {user.role === "ADMIN" && (
                    <>
                      <button 
                        className="dropdown-item admin-item"
                        onClick={() => handleNavigation("/admin/dashboard")}
                      >
                        <span className="dropdown-icon">
                          <AdminIcon />
                        </span>
                        Admin Dashboard
                      </button>
                      <div className="dropdown-divider"></div>
                    </>
                  )}

                  {/* Logout */}
                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">
                      <LogoutIcon />
                    </span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;