import React, { useState, useEffect } from "react";
import customersApi from "../../api/customersApi"; 
import "../../styles/admin/users.css"; 

// --- Icons ---
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C6C6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const ArrowLeft = () => (
  <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
    <path d="M1 6.36401C0.447715 6.36401 0 6.81173 0 7.36401C0 7.9163 0.447715 8.36401 1 8.36401V7.36401V6.36401ZM20.7071 8.07112C21.0976 7.6806 21.0976 7.04743 20.7071 6.65691L14.3431 0.292946C13.9526 -0.0975785 13.3195 -0.0975785 12.9289 0.292946C12.5384 0.68347 12.5384 1.31664 12.9289 1.70716L18.5858 7.36401L12.9289 13.0209C12.5384 13.4114 12.5384 14.0446 12.9289 14.4351C13.3195 14.8256 13.9526 14.8256 14.3431 14.4351L20.7071 8.07112ZM1 7.36401V8.36401H20V7.36401V6.36401H1V7.36401Z" fill="#0038A8" transform="scale(-1, 1) translate(-21, 0)"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
     <path d="M1 6.36401C0.447715 6.36401 0 6.81173 0 7.36401C0 7.9163 0.447715 8.36401 1 8.36401V7.36401V6.36401ZM20.7071 8.07112C21.0976 7.6806 21.0976 7.04743 20.7071 6.65691L14.3431 0.292946C13.9526 -0.0975785 13.3195 -0.0975785 12.9289 0.292946C12.5384 0.68347 12.5384 1.31664 12.9289 1.70716L18.5858 7.36401L12.9289 13.0209C12.5384 13.4114 12.5384 14.0446 12.9289 14.4351C13.3195 14.8256 13.9526 14.8256 14.3431 14.4351L20.7071 8.07112ZM1 7.36401V8.36401H20V7.36401V6.36401H1V7.36401Z" fill="#0038A8"/>
  </svg>
);

const UsersOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch customers
        const customersResponse = await customersApi.get("");
        
        if (customersResponse.data && Array.isArray(customersResponse.data)) {
          // Filter out admin user
          const filteredCustomers = customersResponse.data.filter(user => 
            user.email !== "admin@pinoyheritage.com"
          );
          
          setUsers(filteredCustomers);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.warn("Failed to fetch customers:", err);
        if (err.response?.data && Array.isArray(err.response.data)) {
          const filteredCustomers = err.response.data.filter(user => 
            user.email !== "admin@pinoyheritage.com"
          );
          setUsers(filteredCustomers);
        } else {
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    
    const fullName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const finalName = (fullName || user.username || "").toLowerCase();
    
    const email = (user.email || "").toLowerCase();
    const phone = (user.phone || user.phoneNumber || "").toLowerCase();

    return (
      finalName.includes(term) ||
      email.includes(term) ||
      phone.includes(term)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading users...</div>;

  return (
    <div className="users-container">
      {/* Header */}
      <div className="users-header-top">
        <h2 className="users-title">Customers ({filteredUsers.length})</h2>
        <div className="users-search-wrapper">
          <SearchIcon />
          <input 
            type="text" 
            placeholder="Search user" 
            className="users-search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Headers */}
      <div className="users-table-header">
        <div className="col-name">Name</div>
        <div className="col-email">Email</div>
        <div className="col-phone">Phone Number</div>
        <div className="col-actions">Actions</div>
      </div>

      <div className="users-divider"></div>

      {/* Table List */}
      <div className="users-list">
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map((user, index) => (
            <div key={user.id || index}>
              <div className="users-row">
                <div className="col-name">
                  {user.name 
                    ? user.name 
                    : (user.firstName || user.lastName) 
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() 
                        : (user.username || "N/A")
                  }
                </div>
                <div className="col-email">{user.email || "N/A"}</div>
                <div className="col-phone">{user.phone || user.phoneNumber || "N/A"}</div>
                <div className="col-actions view-action">
                  <EyeIcon />
                  <span>View only</span>
                </div>
              </div>
              {index !== paginatedUsers.length - 1 && <div className="users-divider light"></div>}
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            {searchTerm ? `No users found matching "${searchTerm}"` : "No registered customers yet"}
          </div>
        )}
      </div>

      {/* Pagination - Only show if there are 10 or more customers */}
      {filteredUsers.length >= 10 && (
        <div className="users-pagination">
          <button 
            className="nav-btn" 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ArrowLeft />
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button 
            className="nav-btn" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <ArrowRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersOverview;