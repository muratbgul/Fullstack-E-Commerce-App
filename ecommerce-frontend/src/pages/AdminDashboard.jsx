import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { decodeToken } from '../utils/authUtils';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminUsers from '../components/admin/AdminUsers';



export default function AdminDashboard() {
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decoded = decodeToken(token);
    if (decoded) {
      setEmail(decoded.email);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'products': return <AdminProducts />;
      case 'orders': return <AdminOrders />;
      case 'users': return <AdminUsers />;
      default: return <AdminProducts />;
    }
  };

  return (
    <div className="admin-page-container">
      <Navbar email={email} />
      
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <h3>Admin Portal</h3>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Products Management
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              🛒 Orders Management
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users Management
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="admin-content-area">
          <div className="admin-card">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
