import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/customer/orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setError("Please login to view your orders.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/orders/customer/${userId}`);
        if (!res.ok) {
          throw new Error("Failed to load orders");
        }
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders", err);
        setError("Error loading your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const getStatusColor = (status) => {
    const statusMap = {
      "Pending": "status-pending",
      "Processing": "status-processing",
      "Shipped": "status-shipped",
      "Delivered": "status-delivered",
      "Cancelled": "status-cancelled"
    };
    return statusMap[status] || "status-default";
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      "Pending": "⏳",
      "Processing": "📦",
      "Shipped": "🚚",
      "Delivered": "✅",
      "Cancelled": "❌"
    };
    return iconMap[status] || "📋";
  };

  const filterOrders = () => {
    if (activeTab === "all") return orders;
    return orders.filter(order => order.status.toLowerCase() === activeTab);
  };

  const filteredOrders = filterOrders();

  // --- FIXED: pass productId to Review page ---
  const handleLeaveReview = (productId) => {
    navigate("/review", { state: { productId } });
  };

  return (
    <div className="orders-page">
      <Header showNav={true} />

      <div className="orders-wrapper">
        <div className="orders-container">
          <div className="orders-header">
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-subtitle">Track and manage your orders</p>
          </div>

          <div className="orders-tabs">
            <button
              className={`tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Orders
            </button>
            <button
              className={`tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
            <button
              className={`tab ${activeTab === "processing" ? "active" : ""}`}
              onClick={() => setActiveTab("processing")}
            >
              Processing
            </button>
            <button
              className={`tab ${activeTab === "shipped" ? "active" : ""}`}
              onClick={() => setActiveTab("shipped")}
            >
              Shipped
            </button>
            <button
              className={`tab ${activeTab === "delivered" ? "active" : ""}`}
              onClick={() => setActiveTab("delivered")}
            >
              Delivered
            </button>
          </div>

          {loading ? (
            <div className="orders-loading">
              <div className="spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="orders-error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-empty">
              <span className="empty-icon">📦</span>
              <h3>No orders found</h3>
              <p>You haven't placed any orders yet</p>
              <button
                className="btn-shop"
                onClick={() => navigate("/catalog")}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div key={order.orderId} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <span className="order-number">Order #{order.orderId}</span>
                      <span className="order-date">
                        {new Date(order.orderDate || Date.now()).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                    <div className={`order-status ${getStatusColor(order.status)}`}>
                      <span className="status-icon">{getStatusIcon(order.status)}</span>
                      <span className="status-text">{order.status}</span>
                    </div>
                  </div>

                  <div className="order-products">
                    {order.products && order.products.map((product) => (
                      <div key={product.productId} className="order-product-item">
                        {product.productImage ? (
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="product-image"
                          />
                        ) : (
                          <div className="product-image placeholder">
                            {product.productName?.charAt(0)}
                          </div>
                        )}
                        <div className="product-details">
                          <h4 className="product-name">{product.productName}</h4>
                          <p className="product-quantity">Quantity: {product.quantity}</p>
                          <p className="product-price">
                            ₱{((product.unitPrice || 0) * product.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Leave Review button per product */}
                        <button
                          className={`btn-review ${
                            order.status === "Delivered" ? "" : "disabled"
                          }`}
                          onClick={() => handleLeaveReview(product.productId)}
                          disabled={order.status !== "Delivered"}
                        >
                          {order.status === "Delivered"
                            ? `⭐ Leave a Review`
                            : "🔒 Review Locked"}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <span className="total-label">Total Amount:</span>
                      <span className="total-amount">
                        ₱{(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="order-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => navigate(`/order/${order.orderId}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
