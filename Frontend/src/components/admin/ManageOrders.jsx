import React, { useEffect, useState } from "react";
import "../../styles/admin/orders.css";

// --- Icons (Moved outside main component) ---
const ArrowLeft = () => (
  <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
    <path d="M1 6.36401C0.447715 6.36401 0 6.81173 0 7.36401C0 7.9163 0.447715 8.36401 1 8.36401V7.36401V6.36401ZM20.7071 8.07112C21.0976 7.6806 21.0976 7.04743 20.7071 6.65691L14.3431 0.292946C13.9526 -0.0975785 13.3195 -0.0975785 12.9289 0.292946C12.5384 0.68347 12.5384 1.31664 12.9289 1.70716L18.5858 7.36401L12.9289 13.0209C12.5384 13.4114 12.5384 14.0446 12.9289 14.4351C13.3195 14.8256 13.9526 14.8256 14.3431 14.4351L20.7071 8.07112ZM1 7.36401V8.36401H20V7.36401V6.36401H1V7.36401Z" fill="#0038A8" transform="scale(-1, 1) translate(-21, 0)" />
  </svg>
);

const ArrowRight = () => (
  <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
    <path d="M1 6.36401C0.447715 6.36401 0 6.81173 0 7.36401C0 7.9163 0.447715 8.36401 1 8.36401V7.36401V6.36401ZM20.7071 8.07112C21.0976 7.6806 21.0976 7.04743 20.7071 6.65691L14.3431 0.292946C13.9526 -0.0975785 13.3195 -0.0975785 12.9289 0.292946C12.5384 0.68347 12.5384 1.31664 12.9289 1.70716L18.5858 7.36401L12.9289 13.0209C12.5384 13.4114 12.5384 14.0446 12.9289 14.4351C13.3195 14.8256 13.9526 14.8256 14.3431 14.4351L20.7071 8.07112ZM1 7.36401V8.36401H20V7.36401V6.36401H1V7.36401Z" fill="#0038A8" />
  </svg>
);

const OrdersSection = () => {
  // 1. State for Filters
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/orders/admin");
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders", err);
      }
    };

    fetchOrders();
  }, []);

  // 2. Filter Logic
  const filteredOrders = orders.filter((order) => {
    // A. Search Filter (Checks ID or Customer Name)
    const matchesSearch =
      String(order.id).toLowerCase().includes(search.toLowerCase()) ||
      (order.customerName || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus
      ? order.status === selectedStatus
      : true; // If no status selected, show all

    let matchesDate = true;
    if (selectedDate) {
      const [year, month, day] = selectedDate.split("-");
      const formattedInput = `${month}/${day}/${year.slice(2)}`;
      matchesDate = (order.createdAt || "").startsWith(formattedInput);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // 3. Handler to update status (Uses ID to find correct item)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:8080/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedOrders = orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (err) {
      console.error("Error updating order status", err);
    }
  };

  return (
    <div className="manage-orders-container">
      {/* --- Controls --- */}
      <div className="order-controls">
        <input
          type="text"
          placeholder="Search order"
          className="order-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Date Filter */}
        <input
          type="date"
          className="order-filter-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        {/* Status Filter */}
        <select
          className="order-filter-status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">Delivery Status</option> {/* Empty value resets filter */}
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* --- Summary Text --- */}
      <p className="order-summary-text">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      {/* --- Table Header --- */}
      <div className="order-header-row">
        <p>Order</p>
        <p>Date</p>
        <p>Customer</p>
        <p>Total</p>
        <p>Delivery Status</p>
        <p className="text-center">Items</p>
      </div>

      <div className="order-divider"></div>

      {/* --- Table Rows --- */}
      <div className="orders-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id}> 
              <div className="order-row">
                <p className="fw-bold">#{order.id}</p>
                <p>{order.createdAt || ""}</p>
                <p>{order.customerName}</p>
                <p>P{(order.totalAmount || 0).toFixed(2)}</p>

                {/* Dynamic Status Dropdown */}
                <div className="status-cell">
                  <select
                    className={`order-status-dropdown ${order.status.toLowerCase()}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <p className="text-center">{order.itemsCount}</p>
              </div>
              <div className="order-divider light"></div>
            </div>
          ))
        ) : search ? (
          <p style={{ textAlign: "center", width: "100%", padding: "2rem 0" }} className="no-results">
            No orders found matching "{search}"
          </p>
        ) : (
          <p style={{ textAlign: "center", width: "100%", padding: "2rem 0", fontStyle: "italic" }} className="no-results">
            No orders found
          </p>
        )}
      </div>

      {/* --- Pagination --- */}
      <div className="order-pagination">
        <button className="nav-btn"><ArrowLeft /></button>
        <span className="page-text">Page 1 of 2</span>
        <button className="nav-btn"><ArrowRight /></button>
      </div>
    </div>
  );
};

export default OrdersSection;