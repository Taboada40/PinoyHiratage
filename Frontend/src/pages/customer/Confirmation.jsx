import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/customer/confirmation.css";

export default function Confirmation() {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching order details
    // In production, you'd get orderId from route params or state
    setTimeout(() => {
      setOrderDetails({
        orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        paymentMethod: "Credit/Debit Card",
        estimatedDelivery: "3-5 business days",
        items: [
          {
            id: 1,
            name: "Premium Wireless Headphones",
            price: 2499,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
          },
          {
            id: 2,
            name: "Smart Watch Pro",
            price: 8999,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
          },
        ],
        shippingAddress: {
          name: "Juan Dela Cruz",
          phone: "09123456789",
          street: "123 Mabini Street",
          city: "Quezon City",
          province: "Metro Manila",
          postalCode: "1100",
        },
        subtotal: 11498,
        discount: 1149.8,
        shipping: 0,
        total: 10348.2,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="confirmation-page">
        <Header showNav />
        <div className="confirmation-loading">
          <div className="spinner"></div>
          <p>Loading your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <Header showNav />

      <div className="confirmation-wrapper">
        <div className="confirmation-container">
          {/* Success Section */}
          <div className="success-section">
            <div className="success-icon-wrapper">
              <div className="success-icon">✓</div>
            </div>
            <h1 className="success-title">Order Confirmed!</h1>
            <p className="success-message">
              Thank you for your purchase. Your order has been successfully placed
              and is being processed.
            </p>
            <div className="order-number">
              <span className="order-number-label">Order Number:</span>
              <span className="order-number-value">{orderDetails.orderNumber}</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            <div className="step completed">
              <div className="step-number">✓</div>
              <div className="step-label">Delivery Info</div>
            </div>
            <div className="step-divider"></div>
            <div className="step completed">
              <div className="step-number">✓</div>
              <div className="step-label">Payment</div>
            </div>
            <div className="step-divider"></div>
            <div className="step active">
              <div className="step-number">✓</div>
              <div className="step-label">Confirmation</div>
            </div>
          </div>

          <div className="confirmation-content">
            {/* Order Details */}
            <div className="confirmation-main">
              {/* Order Info Card */}
              <section className="confirmation-card">
                <div className="card-header">
                  <span className="card-icon">📦</span>
                  <h2 className="card-title">Order Information</h2>
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Order Date</span>
                    <span className="info-value">{orderDetails.date}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Order Time</span>
                    <span className="info-value">{orderDetails.time}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Payment Method</span>
                    <span className="info-value">{orderDetails.paymentMethod}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Estimated Delivery</span>
                    <span className="info-value highlighted">
                      {orderDetails.estimatedDelivery}
                    </span>
                  </div>
                </div>
              </section>

              {/* Shipping Address Card */}
              <section className="confirmation-card">
                <div className="card-header">
                  <span className="card-icon">📍</span>
                  <h2 className="card-title">Shipping Address</h2>
                </div>

                <div className="address-content">
                  <div className="address-line">
                    <span className="address-icon">👤</span>
                    <span>{orderDetails.shippingAddress.name}</span>
                  </div>
                  <div className="address-line">
                    <span className="address-icon">📱</span>
                    <span>{orderDetails.shippingAddress.phone}</span>
                  </div>
                  <div className="address-line">
                    <span className="address-icon">🏠</span>
                    <span>{orderDetails.shippingAddress.street}</span>
                  </div>
                  <div className="address-line">
                    <span className="address-icon">🏙️</span>
                    <span>
                      {orderDetails.shippingAddress.city},{" "}
                      {orderDetails.shippingAddress.province}
                    </span>
                  </div>
                  <div className="address-line">
                    <span className="address-icon">📮</span>
                    <span>{orderDetails.shippingAddress.postalCode}</span>
                  </div>
                </div>
              </section>

              {/* Order Items Card */}
              <section className="confirmation-card">
                <div className="card-header">
                  <span className="card-icon">🛍️</span>
                  <h2 className="card-title">Order Items</h2>
                </div>

                <div className="order-items-list">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="order-item-image"
                      />
                      <div className="order-item-details">
                        <h4 className="order-item-name">{item.name}</h4>
                        <p className="order-item-qty">Quantity: {item.quantity}</p>
                      </div>
                      <div className="order-item-price">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => navigate("/orders")}
                >
                  View Order History
                </button>
                <button
                  className="btn-primary"
                  onClick={() => navigate("/catalog")}
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <aside className="confirmation-summary">
              <div className="summary-header">
                <h2 className="summary-title">Order Summary</h2>
              </div>

              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₱{orderDetails.subtotal.toFixed(2)}</span>
                </div>

                {orderDetails.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount (10%)</span>
                    <span>-₱{orderDetails.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-shipping">Free</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total">
                  <span>Total Paid</span>
                  <span>₱{orderDetails.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="email-notice">
                <span className="email-icon">📧</span>
                <p>
                  A confirmation email has been sent to your registered email
                  address with order details and tracking information.
                </p>
              </div>

              <div className="help-section">
                <h3 className="help-title">Need Help?</h3>
                <div className="help-links">
                  <a href="/support" className="help-link">
                    <span>💬</span>
                    Contact Support
                  </a>
                  <a href="/faq" className="help-link">
                    <span>❓</span>
                    FAQs
                  </a>
                  <a href="/track" className="help-link">
                    <span>📦</span>
                    Track Order
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}