import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import ProfileSidebar from "../../components/customer/ProfileSidebar";
import "../../styles/admin/admin.css";
import "../../styles/customer/profile.css";
import "../../styles/customer/notifications.css";

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  const fetchNotifications = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/notifications/customer/${userId}`
      );
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const handleMarkAllRead = async () => {
    try {
      await fetch(
        `http://localhost:8080/api/notifications/customer/${userId}/mark-all-read`,
        { method: "POST" }
      );
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) return;
    
    try {
      await fetch(
        `http://localhost:8080/api/notifications/customer/${userId}`,
        { method: "DELETE" }
      );
      setNotifications([]);
    } catch (err) {
      console.error("Error deleting all notifications:", err);
    }
  };

  const handleDeleteOne = async (notifId) => {
    try {
      await fetch(
        `http://localhost:8080/api/notifications/${notifId}`,
        { method: "DELETE" }
      );
      setNotifications(notifications.filter(n => n.id !== notifId));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="profile-page">
      <Header showNav={true} />

      <main className="main-content">
        <div className="profile-container">
          <div className="profile-card notifications-card">
            <div className="notifications-header">
              <h2 className="profile-title">
                <BellIcon /> Notifications
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount} new</span>
                )}
              </h2>
              <div className="notifications-actions">
                <button 
                  className="notif-action-btn"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </button>
                <button 
                  className="notif-action-btn delete-btn"
                  onClick={handleDeleteAll}
                  disabled={notifications.length === 0}
                >
                  Delete all
                </button>
              </div>
            </div>

            {loading && <p className="notif-loading">Loading notifications...</p>}

            {!loading && notifications.length === 0 && (
              <div className="notif-empty">
                <BellIcon />
                <p>No notifications yet</p>
                <span>Order updates and alerts will appear here</span>
              </div>
            )}

            {!loading && notifications.length > 0 && (
              <div className="notifications-list">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`notification-container ${n.read ? "read" : "unread"}`}
                  >
                    <div className="notif-indicator">
                      {!n.read && <span className="unread-dot"></span>}
                    </div>
                    <div className="notif-content">
                      <p className="notif-message">{n.message}</p>
                      <div className="notif-meta">
                        {n.orderId && <span className="notif-order">Order #{n.orderId}</span>}
                        <span className="notif-time">{formatDate(n.createdAt)}</span>
                      </div>
                    </div>
                    <button 
                      className="notif-delete-btn"
                      onClick={() => handleDeleteOne(n.id)}
                      aria-label="Delete notification"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
