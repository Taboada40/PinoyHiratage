import React, { useState, useEffect } from 'react';
import '../../styles/products/ProductInfo.css';

function ProductInfo({ product }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const [wishlistMessage, setWishlistMessage] = useState('');

  // Helper function to display sizes properly
  const getAvailableSizes = () => {
    if (!product.sizes || product.sizes.length === 0) return [];
    
    // If sizes is already an array, return it
    if (Array.isArray(product.sizes)) return product.sizes;
    
    // If it's a JSON string, try to parse it
    try {
      const parsed = JSON.parse(product.sizes);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // If parsing fails, try to handle as comma-separated string
      if (typeof product.sizes === 'string') {
        return product.sizes.split(',').map(size => size.trim()).filter(size => size !== '');
      }
      return [];
    }
  };

  const availableSizes = getAvailableSizes();
  const hasSizes = availableSizes.length > 0;

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    
    if (userId) {
      return {
        id: userId,
        username,
        email,
        role
      };
    }
    return null;
  };

  // Check if product is already in wishlist on component mount
  useEffect(() => {
    checkIfInWishlist();
  }, [product]);

  const checkIfInWishlist = async () => {
    const user = getCurrentUser();
    if (!user || user.role === 'ADMIN') return;

    try {
      const response = await fetch(`http://localhost:8080/api/wishlist/check/${product.id}`, {
        headers: {
          'userId': user.id
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  // Add to wishlist functionality
  const handleAddToWishlist = async () => {
    const user = getCurrentUser();
    
    if (!user) {
      setWishlistMessage('Please log in to add to wishlist');
      setTimeout(() => setWishlistMessage(''), 3000);
      return;
    }

    if (user.role === 'ADMIN') {
      setWishlistMessage('Admins cannot add to wishlist');
      setTimeout(() => setWishlistMessage(''), 3000);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': user.id
        },
        body: JSON.stringify({
          productId: product.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(true);
        setWishlistMessage('✓ Added to wishlist!');
        console.log('Wishlist add response:', data);
      } else {
        const errorData = await response.json();
        setWishlistMessage(errorData.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setWishlistMessage('Error adding to wishlist');
    }

    setTimeout(() => setWishlistMessage(''), 3000);
  };

  // Remove from wishlist functionality
  const handleRemoveFromWishlist = async () => {
    const user = getCurrentUser();
    if (!user || user.role === 'ADMIN') return;

    try {
      console.log('Removing product from wishlist:', product.id, 'for user:', user.id);
      
      const response = await fetch(`http://localhost:8080/api/wishlist/remove/${product.id}`, {
        method: 'DELETE',
        headers: {
          'userId': user.id
        }
      });

      console.log('Remove response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(false);
        setWishlistMessage('✓ Removed from wishlist');
        console.log('Wishlist remove response:', data);
      } else {
        // Try to get error message from response
        let errorMessage = 'Failed to remove from wishlist';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.log('Could not parse error response');
        }
        setWishlistMessage(errorMessage);
        console.error('Remove failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setWishlistMessage('Error removing from wishlist: ' + error.message);
    }

    setTimeout(() => setWishlistMessage(''), 3000);
  };

  // Toggle favorite status
  const handleFavoriteToggle = () => {
    if (isFavorite) {
      handleRemoveFromWishlist();
    } else {
      handleAddToWishlist();
    }
  };

  const addToGuestCart = (cartItem) => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');

    const existingItemIndex = guestCart.findIndex(item => 
      item.productName === cartItem.productName && 
      (!hasSizes || item.size === selectedSize)
    );

    if (existingItemIndex > -1) {
      guestCart[existingItemIndex].quantity += cartItem.quantity;
      guestCart[existingItemIndex].amount = guestCart[existingItemIndex].unitPrice * guestCart[existingItemIndex].quantity;
    } else {
      const newItem = {
        id: Date.now(),
        ...cartItem
      };
      guestCart.push(newItem);
    }

    localStorage.setItem('guestCart', JSON.stringify(guestCart));
  };

  const addToUserFallbackCart = (user, cartItem) => {
    if (!user || !user.id) return;
    const key = `userCart_${user.id}`;
    const userCart = JSON.parse(localStorage.getItem(key) || '[]');

    const existingItemIndex = userCart.findIndex(item => 
      item.productName === cartItem.productName && 
      (!hasSizes || item.size === selectedSize)
    );

    if (existingItemIndex > -1) {
      userCart[existingItemIndex].quantity += cartItem.quantity;
      userCart[existingItemIndex].amount = userCart[existingItemIndex].unitPrice * userCart[existingItemIndex].quantity;
    } else {
      const newItem = {
        id: Date.now(),
        ...cartItem
      };
      userCart.push(newItem);
    }

    localStorage.setItem(key, JSON.stringify(userCart));
  };

  // NEW: Remove from wishlist when adding to cart
  const removeFromWishlistAfterCart = async (user) => {
    if (!user || user.role === 'ADMIN' || !isFavorite) return;

    try {
      console.log('🔄 Removing from wishlist after adding to cart...');
      const response = await fetch(`http://localhost:8080/api/wishlist/remove/${product.id}`, {
        method: 'DELETE',
        headers: {
          'userId': user.id
        }
      });

      if (response.ok) {
        setIsFavorite(false);
        console.log('✅ Successfully removed from wishlist after cart addition');
      } else {
        console.warn('⚠️ Could not remove from wishlist after cart addition');
      }
    } catch (error) {
      console.error('Error removing from wishlist after cart:', error);
    }
  };

  // Add to cart functionality - UPDATED
  const handleAddToCart = async () => {
    if (hasSizes && !selectedSize) {
      alert('Please select a size');
      return;
    }

    if (product.stock === 0) {
      alert('Product is out of stock');
      return;
    }

    const user = getCurrentUser();

    // Ensure we always send a proper Category reference with an id
    const categoryPayload = product.category && typeof product.category === 'object'
      ? { id: product.category.id }
      : null;

    const cartItem = {
      productName: product.name,
      category: categoryPayload,
      quantity: quantity,
      unitPrice: parseFloat(product.price || 0),
      amount: parseFloat(product.price || 0) * quantity,
      size: selectedSize,
      productImage: product.imageUrl || product.image // Add product image
    };

    try {
      if (user) {
        console.log('Adding to cart for user:', user.id, cartItem);
        const response = await fetch(`http://localhost:8080/api/cart/customer/${user.id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cartItem),
        });

        const data = await response.json();
        console.log('Cart response:', data);

        if (response.ok && data.success) {
          setAddToCartMessage('✓ Added to cart!');
          
          // NEW: Remove from wishlist if it was in wishlist
          if (isFavorite) {
            await removeFromWishlistAfterCart(user);
          }
        } else {
          console.error('Backend error:', data.error);
          // Backend failed: fall back to per-user local cart
          addToUserFallbackCart(user, cartItem);
          setAddToCartMessage('✓ Added to cart (saved locally)');
          
          // NEW: Remove from wishlist if it was in wishlist (for local cart too)
          if (isFavorite) {
            await removeFromWishlistAfterCart(user);
          }
        }
      } else {
        // Guest users: always use local storage
        addToGuestCart(cartItem);
        setAddToCartMessage('✓ Added to cart!');
        // Guests don't have wishlists, so no need to remove
      }

      setTimeout(() => setAddToCartMessage(''), 3000);
      setSelectedSize('');
      setQuantity(1);
      
    } catch (error) {
      console.error('Error adding to cart:', error);

      // On any unexpected error, still save locally so the user keeps their cart
      if (user) {
        addToUserFallbackCart(user, cartItem);
        setAddToCartMessage('✓ Added to cart (offline)');
        
        // NEW: Remove from wishlist if it was in wishlist (for offline too)
        if (isFavorite) {
          await removeFromWishlistAfterCart(user);
        }
      } else {
        addToGuestCart(cartItem);
        setAddToCartMessage('✓ Added to cart!');
      }

      setTimeout(() => setAddToCartMessage(''), 3000);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="product-info-section">
      <div className="product-header">
        <div>
          <h1 className="product-title">{product.name}</h1>
          <div className="product-category">
            <strong>Category:</strong> {typeof product.category === 'object' ? product.category.name : product.category}
          </div>
        </div>
        <div className="product-price-main">₱{parseFloat(product.price || 0).toFixed(2)}</div>
      </div>

      <p className="product-description-full">{product.description}</p>

      {/* Success Messages */}
      {addToCartMessage && (
        <div className={`add-to-cart-message ${addToCartMessage.includes('✓') ? 'success' : 'error'}`}>
          {addToCartMessage}
        </div>
      )}

      {wishlistMessage && (
        <div className={`wishlist-message ${wishlistMessage.includes('✓') ? 'success' : 'error'}`}>
          {wishlistMessage}
        </div>
      )}

      {/* Size Selector - Only show if product has sizes */}
      {hasSizes && (
        <div className="size-selector">
          <label className="size-label">Size</label>
          <select 
            value={selectedSize} 
            onChange={(e) => setSelectedSize(e.target.value)}
            className="size-dropdown"
          >
            <option value="">Select size</option>
            {availableSizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="quantity-selector">
        <label className="quantity-label">Quantity</label>
        <div className="quantity-controls">
          <button 
            type="button"
            className="quantity-btn"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="quantity-display">{quantity}</span>
          <button 
            type="button"
            className="quantity-btn"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
        <span className="stock-info">({product.stock} available)</span>
      </div>

      {/* Stock Status */}
      <div className="stock-status">
        {product.stock > 0 ? (
          <span className="in-stock">✓ In Stock</span>
        ) : (
          <span className="out-of-stock">✗ Out of Stock</span>
        )}
      </div>

      <div className="action-buttons">
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteToggle}
          type="button"
          title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          className="add-to-cart-btn-main" 
          onClick={handleAddToCart}
          disabled={product.stock === 0 || (hasSizes && !selectedSize)}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductInfo;