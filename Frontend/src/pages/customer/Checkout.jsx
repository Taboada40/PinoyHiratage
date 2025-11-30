import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/customer/checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showPhilNotice, setShowPhilNotice] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    province: "",
    city: "",
    postalCode: "",
    country: "Philippines",
  });

  const userId = localStorage.getItem("userId");

  // -----------------------------
  //  Location Data
  // -----------------------------
  const philippineProvinces = [
    "Metro Manila",
    "Cebu",
    "Davao del Sur",
    "Pangasinan",
    "Laguna",
    "Cavite",
    "Bulacan",
    "Rizal",
    "Batangas",
    "Pampanga",
  ];

  const cities = {
    "Metro Manila": ["Quezon City", "Manila", "Makati", "Pasig", "Taguig", "Parañaque", "Las Piñas"],
    Cebu: ["Cebu City", "Mandaue", "Lapu-Lapu City", "Talisay", "Danao"],
    "Davao del Sur": ["Davao City", "Digos", "Panabo", "Tagum", "Samal"],
    Pangasinan: ["Dagupan", "Lingayen", "Alaminos", "San Carlos", "Urdaneta"],
    Laguna: ["Santa Rosa", "Calamba", "San Pablo", "Biñan", "Cabuyao"],
    Cavite: ["Bacoor", "Dasmariñas", "Imus", "Cavite City", "Tagaytay"],
    Bulacan: ["Malolos", "Meycauayan", "San Jose del Monte", "Marilao"],
    Rizal: ["Antipolo", "Cainta", "Taytay", "Binangonan", "Rodriguez"],
    Batangas: ["Batangas City", "Lipa", "Tanauan", "Santo Tomas"],
    Pampanga: ["San Fernando", "Angeles City", "Mabalacat", "Mexico"],
  };

  const getUserFallbackCart = (id) => {
    const data = localStorage.getItem(`userCart_${id}`);
    return data ? JSON.parse(data) : [];
  };

  // -----------------------------
  //  Load Cart
  // -----------------------------
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) {
        setError("Please login to continue checkout.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8080/api/cart/customer/${userId}/items`
        );

        if (res.ok) {
          setCartItems(await res.json());
        } else {
          setError("Failed to load cart. Showing saved cart.");
          setCartItems(getUserFallbackCart(userId));
        }
      } catch {
        setError("Server connection error. Showing saved cart.");
        setCartItems(getUserFallbackCart(userId));
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  // -----------------------------
  //  Handlers
  // -----------------------------
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRemoveItem = async (itemId) => {
    try {
      if (userId) {
        await fetch(
          `http://localhost:8080/api/cart/customer/${userId}/items/${itemId}`,
          { method: "DELETE" }
        );
      }
    } catch {}

    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === "SAVE10") {
      setAppliedDiscount("SAVE10");
    } else {
      alert("Invalid discount code");
      setDiscountCode("");
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount("");
    setDiscountCode("");
  };

  const validateFields = () => {
    const errors = {};

    if (!address.fullName.trim()) errors.fullName = "Full name is required";
    if (!address.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^09\d{9}$/.test(address.phone)) errors.phone = "Invalid PH number (09XXXXXXXXX)";
    if (!address.street.trim()) errors.street = "Street address is required";
    if (!address.province) errors.province = "Province is required";
    if (!address.city) errors.city = "City is required";
    if (!address.postalCode.trim()) errors.postalCode = "Postal code is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    
    if (validateFields()) {
      navigate("/payment");
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Header showNav />
        <div className="checkout-loading">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  // -----------------------------
  //  Totals
  // -----------------------------
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.unitPrice || item.price) * item.quantity,
    0
  );

  const discount = appliedDiscount === "SAVE10" ? subtotal * 0.1 : 0;
  const shipping = 0; // Free shipping
  const total = subtotal - discount + shipping;

  // -----------------------------
  //  UI
  // -----------------------------
  return (
    <div className="checkout-page">
      <Header showNav />

      <div className="checkout-wrapper">
        <div className="checkout-container">
          <div className="checkout-main">
            {/* Progress Indicator - 2 Steps */}
            <div className="progress-steps">
              <div className="step active">
                <div className="step-number">1</div>
                <div className="step-label">Delivery Information</div>
              </div>
              <div className="step-divider"></div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-label">Payment</div>
              </div>
            </div>

            <h1 className="checkout-title">Delivery Information</h1>

            {/* Contact Information */}
            <section className="checkout-card">
              <div className="card-header">
                <span className="card-icon">📞</span>
                <h2 className="card-title">Contact Information</h2>
              </div>

              <div className="form-grid">
                <InputField
                  label="Full Name"
                  name="fullName"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  error={validationErrors.fullName}
                  placeholder="Juan Dela Cruz"
                  icon="👤"
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  error={validationErrors.phone}
                  placeholder="09XXXXXXXXX"
                  icon="📱"
                  maxLength={11}
                />
              </div>
            </section>

            {/* Delivery Address */}
            <section className="checkout-card">
              <div className="card-header">
                <span className="card-icon">📍</span>
                <h2 className="card-title">Delivery Address</h2>
              </div>

              <div className="form-grid">
                <div className="full-width">
                  <InputField
                    label="Street Address"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    error={validationErrors.street}
                    placeholder="House No., Building, Street Name"
                    icon="🏠"
                  />
                </div>

                <SelectField
                  label="Province"
                  name="province"
                  value={address.province}
                  onChange={handleAddressChange}
                  error={validationErrors.province}
                  options={philippineProvinces}
                  icon="🗺️"
                />

                <SelectField
                  label="City"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  error={validationErrors.city}
                  options={cities[address.province] || []}
                  disabled={!address.province}
                  icon="🏙️"
                />

                <InputField
                  label="Postal Code"
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  error={validationErrors.postalCode}
                  placeholder="1000"
                  icon="📮"
                  maxLength={4}
                />

                <div className="field-group">
                  <label>
                    <span className="field-icon">🇵🇭</span>
                    Country
                  </label>
                  <input
                    name="country"
                    value={address.country}
                    readOnly
                    onFocus={() => setShowPhilNotice(true)}
                    onBlur={() => setShowPhilNotice(false)}
                    className="readonly-input"
                  />
                </div>
              </div>

              {showPhilNotice && (
                <div className="info-notice">
                  <span className="notice-icon">ℹ️</span>
                  <span>We currently only ship within the Philippines</span>
                </div>
              )}
            </section>

            {/* Discount Code */}
            <section className="checkout-card">
              <div className="card-header">
                <span className="card-icon">🎟️</span>
                <h2 className="card-title">Discount Code</h2>
              </div>

              <div className="discount-input-wrapper">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter discount code"
                  className="discount-input"
                  disabled={appliedDiscount}
                />
                {!appliedDiscount ? (
                  <button onClick={applyDiscount} className="apply-btn">
                    Apply
                  </button>
                ) : (
                  <button onClick={removeDiscount} className="remove-discount-btn">
                    Remove
                  </button>
                )}
              </div>

              {appliedDiscount && (
                <div className="success-notice">
                  <span className="notice-icon">✅</span>
                  <span>Discount code "SAVE10" applied - 10% off!</span>
                </div>
              )}
            </section>
          </div>

          {/* Order Summary */}
          <aside className="checkout-summary">
            <div className="summary-header">
              <h2 className="summary-title">Order Summary</h2>
              <span className="items-count">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
            </div>

            <div className="summary-items">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <span className="empty-icon">🛒</span>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <SummaryItem
                    key={item.id}
                    item={item}
                    onRemove={() => handleRemoveItem(item.id)}
                  />
                ))
              )}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-totals">
              <SummaryRow label="Subtotal" value={subtotal} />
              {discount > 0 && (
                <SummaryRow label="Discount (10%)" value={-discount} discount />
              )}
              <SummaryRow label="Shipping Fee" value="Free" free />
              <div className="summary-divider"></div>
              <SummaryRow label="Total" value={total} bold />
            </div>

            <div className="summary-actions">
              <button className="btn-secondary" onClick={() => navigate("/cart")}>
                ← Back to Cart
              </button>
              <button 
                className="btn-primary" 
                onClick={handleProceedToPayment}
                disabled={cartItems.length === 0}
              >
                Proceed to Payment →
              </button>
            </div>

            <div className="secure-checkout">
              <span className="secure-icon">🔒</span>
              <span>Secure Checkout</span>
            </div>
          </aside>
        </div>

        {error && (
          <div className="checkout-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

/* -----------------------------
   Reusable Components
----------------------------- */
function InputField({ label, name, value, onChange, error, placeholder, icon, maxLength }) {
  return (
    <div className="field-group">
      <label>
        {icon && <span className="field-icon">{icon}</span>}
        {label}
      </label>
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={error ? "invalid" : ""}
        maxLength={maxLength}
      />
      {error && (
        <div className="input-error">
          <span className="error-icon-small">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options,
  disabled,
  icon,
}) {
  return (
    <div className="field-group">
      <label>
        {icon && <span className="field-icon">{icon}</span>}
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={error ? "invalid" : ""}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      {error && (
        <div className="input-error">
          <span className="error-icon-small">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, bold, discount, free }) {
  return (
    <div className={`summary-row ${bold ? "total" : ""} ${discount ? "discount" : ""} ${free ? "free" : ""}`}>
      <span>{label}</span>
      <span>
        {typeof value === "number" 
          ? `₱${value.toFixed(2)}` 
          : value}
      </span>
    </div>
  );
}

function SummaryItem({ item, onRemove }) {
  return (
    <div className="summary-item">
      <div className="summary-item-content">
        {item.productImage ? (
          <img src={item.productImage} alt={item.productName} className="summary-img" />
        ) : (
          <div className="summary-img placeholder">
            {item.productName?.charAt(0)}
          </div>
        )}

        <div className="summary-text">
          <div className="summary-name">{item.productName}</div>
          <div className="summary-meta">
            <span className="qty-badge">Qty: {item.quantity}</span>
            {item.size && <span className="size-badge">Size: {item.size}</span>}
          </div>
          <div className="summary-price">
            ₱{((item.unitPrice || item.price) * item.quantity).toFixed(2)}
          </div>
        </div>
      </div>

      <button className="summary-remove" onClick={onRemove} title="Remove item">
        ×
      </button>
    </div>
  );
}