import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/customer/wishlist.css";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError("Please log in to view your wishlist");
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/wishlist", {
        headers: {
          'userId': userId
        }
      });

      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data.wishlistItems || []);
      } else {
        setError("Failed to load wishlist");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/wishlist/remove/${productId}`, {
        method: "DELETE",
        headers: {
          'userId': userId
        }
      });

      if (res.ok) {
        // Remove from local state
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      } else {
        setError("Failed to remove from wishlist");
      }
    } catch (err) {
      setError("Error removing from wishlist");
      console.error("Error removing from wishlist:", err);
    }
  };

  // Redirect to login if not authenticated
  if (!userId) {
    return (
      <div className="wishlist-page-container">
        <Header />
        <div className="wishlist-page">
          <div className="wishlist-page-content">
            <div className="wishlist-auth-required">
              <div className="wishlist-auth-icon">🔒</div>
              <h2>Authentication Required</h2>
              <p>Please log in to view your wishlist</p>
              <Link to="/login" className="wishlist-btn-primary">Login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-page-container">
        <Header />
        <div className="wishlist-page">
          <div className="wishlist-page-content">
            <div className="wishlist-loading">
              <div className="wishlist-spinner"></div>
              <p>Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page-container">
      <Header />
      <div className="wishlist-page">
        <div className="wishlist-page-content">
          {/* Header Section */}
          <div className="wishlist-page-header">
            <div className="wishlist-page-title">
              <h1>My Wishlist</h1>
              <p>Your saved favorite products</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="wishlist-error">
              <span>{error}</span>
              <button onClick={() => setError("")} className="wishlist-error-close">×</button>
            </div>
          )}

          {/* Empty State */}
          {wishlistItems.length === 0 && !loading && (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h3>Your wishlist is empty</h3>
              <p>Start adding products you love to your wishlist!</p>
              <Link to="/catalog" className="wishlist-btn-primary">Continue Shopping</Link>
            </div>
          )}

          {/* Wishlist Items Grid */}
          {wishlistItems.length > 0 && (
            <>
              <div className="wishlist-summary">
                <span>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in wishlist</span>
              </div>

              <div className="wishlist-items-grid">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="wishlist-item-card">
                    {/* Product Image */}
                    <div className="wishlist-item-image">
                      <img 
                        src={item.productImage || "/default-product.jpg"} 
                        alt={item.productName}
                        onError={(e) => {
                          e.target.src = "/default-product.jpg";
                        }}
                      />
                      <button 
                        className="wishlist-remove-btn"
                        onClick={() => removeFromWishlist(item.productId)}
                        aria-label="Remove from wishlist"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>

                    {/* Product Details */}
                    <div className="wishlist-item-info">
                      <h3 className="wishlist-product-name">{item.productName}</h3>
                      <p className="wishlist-product-price">₱{item.productPrice?.toFixed(2)}</p>
                      <p className="wishlist-added-date">
                        Added on {new Date(item.addedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="wishlist-item-buttons">
                      <Link 
                        to={`/product/${item.productId}`}
                        className="wishlist-btn-outline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;