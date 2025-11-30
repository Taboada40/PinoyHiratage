import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import ConfirmationModal from "../../components/ConfirmationModal";
import "../../styles/customer/payment.css";

const Payment = () => {
  const navigate = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Card payment fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // GCash fields
  const [gcashNumber, setGcashNumber] = useState("");
  const [gcashName, setGcashName] = useState("");

  // Bank Transfer fields
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const getGuestCart = () => {
    const guestCart = localStorage.getItem("guestCart");
    return guestCart ? JSON.parse(guestCart) : [];
  };

  const getUserFallbackCart = (id) => {
    if (!id) return [];
    const key = `userCart_${id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchCart = async () => {
      if (!userId) {
        const guestCart = getGuestCart();
        setCartItems(guestCart);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8080/api/cart/customer/${userId}/items`
        );
        if (res.ok) {
          const data = await res.json();
          setCartItems(data || []);
        } else {
          setError("Unable to load cart from server. Showing last saved cart.");
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
  }, []);

  const shipping = 0;
  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + ((item.unitPrice || item.price || 0) * (item.quantity || 0)),
    0
  );
  const discount = appliedPromo === "SAVE10" ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  const removeItem = async (id) => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      try {
        await fetch(
          `http://localhost:8080/api/cart/customer/${userId}/items/${id}`,
          { method: "DELETE" }
        );
      } catch (err) {
        console.error("Error removing item from backend cart:", err);
      }
      setCartItems((items) => items.filter((item) => item.id !== id));
    } else {
      const updated = cartItems.filter((item) => item.id !== id);
      setCartItems(updated);
      localStorage.setItem("guestCart", JSON.stringify(updated));
    }
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setAppliedPromo("SAVE10");
    } else {
      alert("Invalid promo code");
      setPromoCode("");
    }
  };

  const removePromoCode = () => {
    setAppliedPromo("");
    setPromoCode("");
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted;
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validatePayment = () => {
    if (!selectedMethod) {
      alert("Please select a payment method.");
      return false;
    }

    if (selectedMethod === "Credit/Debit Card") {
      if (!cardName || !cardNumber || !expiryDate || !cvv) {
        alert("Please fill in all card details.");
        return false;
      }
      if (cardNumber.replace(/\s/g, "").length !== 16) {
        alert("Please enter a valid 16-digit card number.");
        return false;
      }
      if (cvv.length !== 3) {
        alert("Please enter a valid 3-digit CVV.");
        return false;
      }
    }

    if (selectedMethod === "GCash") {
      if (!gcashNumber || !gcashName) {
        alert("Please fill in all GCash details.");
        return false;
      }
      if (gcashNumber.length !== 11) {
        alert("Please enter a valid 11-digit mobile number.");
        return false;
      }
    }

    if (selectedMethod === "Bank Transfer") {
      if (!bankName || !accountNumber || !accountName) {
        alert("Please fill in all bank transfer details.");
        return false;
      }
    }

    return true;
  };

  const handleConfirmPayment = async () => {
    if (!validatePayment()) return;

    const userId = localStorage.getItem("userId");

    try {
      if (userId) {
        const response = await fetch(
          `http://localhost:8080/api/orders/customer/${userId}/from-cart`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method: selectedMethod }),
          }
        );

        if (response.ok) {
          localStorage.removeItem(`userCart_${userId}`);
        }
      } else {
        localStorage.removeItem("guestCart");
      }
    } catch (err) {
      console.error("Error creating order from cart", err);
    }

    setShowConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigate("/catalog");
  };

  const paymentMethods = [
    { name: "Credit/Debit Card", icon: "💳" },
    { name: "GCash", icon: "📱" },
    { name: "Bank Transfer", icon: "🏦" },
  ];

  return (
    <div className="payment-page">
      <Header showNav={true} />

      {loading ? (
        <div className="payment-loading">
          <div className="spinner"></div>
          <p>Loading your order...</p>
        </div>
      ) : (
        <div className="payment-wrapper">
          <div className="payment-container">
            <div className="payment-main">
              {/* Progress Steps */}
              <div className="progress-steps">
                <div className="step completed">
                  <div className="step-number">✓</div>
                  <div className="step-label">Delivery Information</div>
                </div>
                <div className="step-divider completed-divider"></div>
                <div className="step active">
                  <div className="step-number">2</div>
                  <div className="step-label">Payment</div>
                </div>
              </div>

              <h1 className="payment-title">Payment Method</h1>

              {/* Payment Method Selection */}
              <section className="payment-card">
                <div className="card-header">
                  <span className="card-icon">💳</span>
                  <h2 className="card-title">Choose Your Payment Method</h2>
                </div>

                <div className="payment-methods-grid">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.name}
                      className={`payment-option ${
                        selectedMethod === method.name ? "selected" : ""
                      }`}
                      onClick={() => setSelectedMethod(method.name)}
                    >
                      <span className="payment-icon">{method.icon}</span>
                      <span className="payment-name">{method.name}</span>
                      {selectedMethod === method.name && (
                        <span className="checkmark">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Payment Form Fields */}
              {selectedMethod === "Credit/Debit Card" && (
                <section className="payment-card">
                  <div className="card-header">
                    <span className="card-icon">💳</span>
                    <h2 className="card-title">Card Information</h2>
                  </div>

                  <div className="payment-form">
                    <div className="form-group">
                      <label>
                        <span className="field-icon">👤</span>
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="field-icon">💳</span>
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          if (formatted.replace(/\s/g, "").length <= 16) {
                            setCardNumber(formatted);
                          }
                        }}
                        className="form-input"
                        maxLength={19}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <span className="field-icon">📅</span>
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            if (formatted.length <= 5) {
                              setExpiryDate(formatted);
                            }
                          }}
                          className="form-input"
                          maxLength={5}
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          <span className="field-icon">🔒</span>
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 3) setCvv(value);
                          }}
                          className="form-input"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {selectedMethod === "GCash" && (
                <section className="payment-card">
                  <div className="card-header">
                    <span className="card-icon">📱</span>
                    <h2 className="card-title">GCash Information</h2>
                  </div>

                  <div className="payment-form">
                    <div className="form-group">
                      <label>
                        <span className="field-icon">📱</span>
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        placeholder="09XXXXXXXXX"
                        value={gcashNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 11) setGcashNumber(value);
                        }}
                        className="form-input"
                        maxLength={11}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="field-icon">👤</span>
                        Account Name
                      </label>
                      <input
                        type="text"
                        placeholder="Juan Dela Cruz"
                        value={gcashName}
                        onChange={(e) => setGcashName(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="info-box">
                      <span className="info-icon">ℹ️</span>
                      <p>
                        You will receive a payment prompt on your GCash app to
                        complete this transaction.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {selectedMethod === "Bank Transfer" && (
                <section className="payment-card">
                  <div className="card-header">
                    <span className="card-icon">🏦</span>
                    <h2 className="card-title">Bank Transfer Information</h2>
                  </div>

                  <div className="payment-form">
                    <div className="form-group">
                      <label>
                        <span className="field-icon">🏦</span>
                        Bank Name
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="form-input"
                      >
                        <option value="">Select Bank</option>
                        <option value="BDO">BDO</option>
                        <option value="BPI">BPI</option>
                        <option value="Metrobank">Metrobank</option>
                        <option value="UnionBank">UnionBank</option>
                        <option value="Security Bank">Security Bank</option>
                        <option value="Landbank">Landbank</option>
                        <option value="PNB">PNB</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="field-icon">🔢</span>
                        Account Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="field-icon">👤</span>
                        Account Name
                      </label>
                      <input
                        type="text"
                        placeholder="Juan Dela Cruz"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="info-box">
                      <span className="info-icon">ℹ️</span>
                      <p>
                        Please transfer to our account and upload proof of
                        payment after checkout.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Promo Code */}
              <section className="payment-card">
                <div className="card-header">
                  <span className="card-icon">🎟️</span>
                  <h2 className="card-title">Promo Code</h2>
                </div>

                <div className="promo-section">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="promo-input"
                    disabled={appliedPromo}
                  />
                  {!appliedPromo ? (
                    <button onClick={applyPromoCode} className="apply-btn">
                      Apply
                    </button>
                  ) : (
                    <button onClick={removePromoCode} className="remove-promo-btn">
                      Remove
                    </button>
                  )}
                </div>

                {appliedPromo && (
                  <div className="success-notice">
                    <span className="notice-icon">✅</span>
                    <span>Discount code "SAVE10" applied - 10% off!</span>
                  </div>
                )}
              </section>
            </div>

            {/* Order Summary Sidebar */}
            <aside className="payment-summary">
              <div className="summary-header">
                <h2 className="summary-title">Order Summary</h2>
                <span className="items-count">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </span>
              </div>

              {error && <p className="payment-error">{error}</p>}

              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <span className="empty-icon">🛒</span>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="item-image"
                        />
                      ) : (
                        <div className="item-image placeholder">
                          {(item.productName || item.name)?.charAt(0)}
                        </div>
                      )}
                      <div className="item-details">
                        <h4 className="item-name">
                          {item.productName || item.name}
                        </h4>
                        <p className="item-qty">Qty: {item.quantity}</p>
                        <p className="item-price">
                          ₱
                          {(
                            (item.unitPrice || item.price || 0) *
                            (item.quantity || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="divider"></div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Discount (10%)</span>
                    <span>-₱{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-shipping">Free</span>
                </div>

                <div className="divider"></div>

                <div className="summary-total">
                  <span>Total</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="summary-actions">
                <button
                  className="btn-secondary"
                  onClick={() => navigate("/checkout")}
                >
                  ← Back
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="btn-primary"
                  disabled={cartItems.length === 0}
                >
                  Complete Payment →
                </button>
              </div>

              <div className="secure-info">
                <span className="secure-icon">🔒</span>
                <span>Secure payment powered by encryption</span>
              </div>
            </aside>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        title="Payment Successful!"
        message="Thank you for your purchase. Your order has been confirmed and will be processed shortly."
      />
    </div>
  );
};

export default Payment;