import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './context/CartContext';
import { decodeToken } from './utils/authUtils';



export default function Navbar({ email }) {
  const navigate = useNavigate();
  const { totalItemsCount, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState('USER');
  const [exchangeRates, setExchangeRates] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decoded = decodeToken(token);
    if (decoded) {
      setRole(decoded.role);
    }

    fetch('http://localhost:8081/exchange-rates')
      .then(res => res.json())
      .then(data => setExchangeRates(data))
      .catch(err => console.error("Could not fetch exchange rates:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearCart();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {exchangeRates && exchangeRates.usd && (
        <div style={{ backgroundColor: '#1a1a1a', color: '#e0e0e0', textAlign: 'center', padding: '5px', fontSize: '13px', letterSpacing: '0.5px' }}>
          USD: {exchangeRates.usd.toFixed(2)} ₺ | EUR: {exchangeRates.eur.toFixed(2)} ₺ | GBP: {exchangeRates.gbp.toFixed(2)} ₺
        </div>
      )}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/products" className="nav-logo">EcommerceApp</Link>

          <button className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle Navigation">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>

          <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            {role === 'ADMIN' && (
              <Link to="/admin" className="nav-item admin-link" onClick={() => setIsMenuOpen(false)}>
                🛡️ Admin Panel
              </Link>
            )}
            <Link to="/products" className="nav-item" onClick={() => setIsMenuOpen(false)}>Products</Link>
            <Link to="/orders" className="nav-item" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
            <Link to="/profile" className="nav-item" onClick={() => setIsMenuOpen(false)}>Profile</Link>
            <Link to="/cart" className="nav-item cart-link" onClick={() => setIsMenuOpen(false)}>
              Cart <span className="cart-badge">{totalItemsCount}</span>
            </Link>
            <div className="nav-auth-section">
              <span className="nav-user">{email} (<b>{role}</b>)</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
