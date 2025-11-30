import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import ProfileSidebar from "../../components/customer/ProfileSidebar";
import "../../styles/admin/admin.css";
import "../../styles/customer/profile.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="profile-page">
      <Header showNav={true} />

      <main className="main-content">
        <div className="profile-container">
          <div className="profile-card">
            <h2 className="profile-title">Your Orders</h2>

            {loading && <p>Loading orders...</p>}
            {error && !loading && <p>{error}</p>}

            {!loading && !error && orders.length === 0 && (
              <p>You have no past orders yet.</p>
            )}

            {!loading && !error && orders.length > 0 && (
              <div className="orders-history-list">
                {orders.map((order) => (
                  <div key={order.orderId} className="order-history-card">
                    <div className="order-history-header">
                      <span className="order-id">Order #{order.orderId}</span>
                      <span className="order-status">{order.status}</span>
                    </div>
                    <div className="order-history-body">
                      <ul className="order-products-list">
                        {order.products && order.products.map((p) => (
                          <li key={p.productId} className="order-product-item">
                            <span className="product-name">{p.productName}</span>
                            <span className="product-qty">Qty: {p.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="order-history-footer">
                      <span className="order-total">Total: ₱{(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
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

export default Orders;
