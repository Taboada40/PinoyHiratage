import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/customer/checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [address, setAddress] = useState({
    street: "",
    city: "",
    province: "",
    country: "",
  });

  const [discountCode, setDiscountCode] = useState("");

  const userId = localStorage.getItem("userId");

  const getUserFallbackCart = (id) => {
    if (!id) return [];
    const key = `userCart_${id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!userId) {
          setError("Please login to continue checkout.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `http://localhost:8080/api/cart/customer/${userId}/items`
        );
        if (res.ok) {
          const data = await res.json();
          setCartItems(data || []);
        } else {
          setError("Failed to load cart items. Showing last saved cart.");
          const fallback = getUserFallbackCart(userId);
          setCartItems(fallback);
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to server. Showing last saved cart.");
        const fallback = getUserFallbackCart(userId);
        setCartItems(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveItem = async (itemId) => {
    try {
      if (userId) {
        await fetch(
          `http://localhost:8080/api/cart/customer/${userId}/items/${itemId}`,
          { method: "DELETE" }
        );
      }
    } catch (err) {
      console.error("Error removing item", err);
    } finally {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.unitPrice || item.price) * item.quantity,
    0
  );
  const shippingFee = 0; // Free for now
  const total = subtotal + shippingFee;

  const handleCancelOrder = () => {
    navigate("/cart");
  };

  const handleProceedToPayment = () => {
    if (!cartItems.length) return;
    navigate("/payment");
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Header showNav={true} />
        <div className="checkout-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header showNav={true} />

      <div className="checkout-container">
        <div className="checkout-main">
          <h1 className="checkout-title">Checkout</h1>

          {/* Delivery Address */}
          <section className="checkout-card">
            <h2 className="delivery-section-title">Delivery Address</h2>
            <div className="address-grid">
              <div className="field-group">
                <label>Street</label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  placeholder="Enter street"
                />
                <div className="field-example">e.g. 123 Mabini St.</div>
              </div>
              <div className="field-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="Enter city"
                />
                <div className="field-example">e.g. Cebu City</div>
              </div>
              <div className="field-group">
                <label>Province</label>
                <input
                  type="text"
                  name="province"
                  value={address.province}
                  onChange={handleAddressChange}
                  placeholder="Enter province"
                />
                <div className="field-example">e.g. Cebu</div>
              </div>
              <div className="field-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                  placeholder="Enter country"
                />
                <div className="field-example">e.g. Philippines</div>
              </div>
            </div>
          </section>

          {/* Discounts */}
          <section className="checkout-card">
            <h2 className="discount-section-title">Discounts</h2>
            <div className="discount-wrapper">
              <label>Enter discount code</label>
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter your discount code"
              />
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="checkout-summary">
          <h2 className="summary-title">Summary</h2>

          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="summary-item-info">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="summary-img"
                    />
                  ) : (
                    <div className="summary-img placeholder">
                      {item.productName?.charAt(0)}
                    </div>
                  )}
                  <div className="summary-text">
                    <div className="summary-name">{item.productName}</div>
                    <div className="summary-meta">
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>
                <div className="summary-item-right">
                  <div className="summary-price">
                    ₱{((item.unitPrice || item.price) * item.quantity).toFixed(2)}
                  </div>
                  <button
                    className="summary-remove"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span>Free</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="summary-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancelOrder}
            >
              Cancel Order
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleProceedToPayment}
            >
              Proceed to Payment
            </button>
          </div>
        </aside>
      </div>

      {error && <div className="checkout-error">{error}</div>}
    </div>
  );
}
