import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/customer/orderDetails.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/orders/customer/${userId}`);
        if (!res.ok) throw new Error("Failed to load orders");

        const data = await res.json();
        const selectedOrder = data.find((o) => o.orderId === parseInt(orderId));
        if (!selectedOrder) throw new Error("Order not found");

        setOrder(selectedOrder);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, userId]);

  if (loading)
    return (
      <div className="order-details-loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );

  if (error)
    return (
      <div className="order-details-error">
        <span>⚠️</span>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="order-details-page">
      <Header showNav={true} />
      <div className="order-details-wrapper">
        <h1>Order #{order.orderId} Details</h1>
        <p className={`status ${order.status.toLowerCase()}`}>Status: {order.status}</p>
        <p className="total-amount">Total Amount: ₱{(order.totalAmount || 0).toFixed(2)}</p>

        <div className="order-items">
          {order.products.map((product) => (
            <div key={product.productId} className="order-item-card">
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
              <div className="product-info">
                <h3>{product.productName}</h3>
                <p>Quantity: {product.quantity}</p>
                <p>Unit Price: ₱{product.unitPrice?.toFixed(2)}</p>
                <p>Color: {product.color || "N/A"}</p>
                <p>Size: {product.size || "N/A"}</p>
                <p>Other Info: {product.otherInfo || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
