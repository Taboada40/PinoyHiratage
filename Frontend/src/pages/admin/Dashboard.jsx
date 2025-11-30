import React, { useState, useEffect } from 'react';
import '../../styles/admin/dashboard.css';
import Sidebar from "../../components/admin/Sidebar";
import customersApi from "../../api/customersApi";

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    orders: 0
  });
  
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:8080';

  // Fetch products and customers data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch products from your existing API
        const productsResponse = await fetch(`${API_BASE}/api/admin/products`);
        
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const productsData = await productsResponse.json();
        
        // Handle both array response and object with 'value' property
        const productsArray = Array.isArray(productsData) ? productsData : (productsData?.value || []);
        
        // Fetch customers from customersApi
        let customersArray = [];
        try {
          const customersResponse = await customersApi.get("");
          customersArray = customersResponse.data && Array.isArray(customersResponse.data) 
            ? customersResponse.data 
            : [];
        } catch (customerError) {
          console.warn('Failed to fetch customers:', customerError);
          customersArray = [];
        }

        // Filter out admin email from customer count
        const filteredCustomers = customersArray.filter(customer => 
          customer.email !== "admin@pinoyheritage.com"
        );

        // Fetch orders count
        let ordersCount = 0;
        try {
          const ordersResponse = await fetch(`${API_BASE}/api/orders`);
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            ordersCount = Array.isArray(ordersData) ? ordersData.length : 0;
          }
        } catch (orderError) {
          console.warn('Failed to fetch orders:', orderError);
        }

        // Update stats with real data 
        setStats({
          customers: filteredCustomers.length,
          products: productsArray.length,
          orders: ordersCount
        });
        
        // Get the 4 most recent products 
        const recentProductsData = productsArray
          .sort((a, b) => b.id - a.id) // Sort by ID
          .slice(0, 4) // Get first 4
          .map(product => ({
            id: product.id,
            name: product.name,
            category: typeof product.category === 'object' ? product.category.name : product.category,
            image: product.imageUrl || 'https://via.placeholder.com/100?text=No+Image'
          }));

        setRecentProducts(recentProductsData);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        
        // Fallback to 0 if API fails completely
        setStats({
          customers: 0,
          products: 0,
          orders: 0
        });
        setRecentProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to handle image errors
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/100?text=No+Image';
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <main className="dashboard-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading dashboard...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <main className="dashboard-container">
          <div style={{ textAlign: 'center', padding: '2rem', color: '#e53e3e' }}>
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-container">
        {/* 1. Stats Cards Section */}
        <div className="dashboard-stats">
          <div className="db-stat-card">
            <h2 className="db-stat-number">{stats.customers}</h2>
            <p className="db-stat-label">Customers</p>
          </div>
          <div className="db-stat-card">
            <h2 className="db-stat-number">{stats.products}</h2>
            <p className="db-stat-label">Products</p>
          </div>
          <div className="db-stat-card">
            <h2 className="db-stat-number">{stats.orders}</h2>
            <p className="db-stat-label">Orders</p>
          </div>
        </div>

        {/* 2. Recent Products Section */}
        <div className="recent-products-section">
          <div className="db-section-header">
            <h3 className="db-section-title">Products</h3>
            <a href="/admin/products" className="view-all-btn">View all</a>
          </div>

          {recentProducts.length > 0 ? (
            <div className="product-list">
              {recentProducts.map((product) => (
                <div key={product.id} className="product-list-item">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="product-thumb" 
                    onError={handleImageError}
                  />
                  <div className="product-details">
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-category">Category: {product.category || 'Uncategorized'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>
              No products found
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;