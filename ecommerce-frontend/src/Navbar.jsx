import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './context/CartContext';
import { decodeToken } from './utils/authUtils';

export default function Navbar({ email }) {
  const navigate = useNavigate();
  const { totalItemsCount, clearCart, cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState('USER');
  const [exchangeRates, setExchangeRates] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [lastItemName, setLastItemName] = useState('');
  const prevCount = React.useRef(totalItemsCount);

  useEffect(() => {
    // Sayı gerçekten arttıysa bildirimi göster
    if (totalItemsCount > prevCount.current && cartItems.length > 0) {
      const latest = cartItems[cartItems.length - 1];
      setLastItemName(latest.name);
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2500);

      return () => clearTimeout(timer);
    }

    prevCount.current = totalItemsCount;
  }, [totalItemsCount, cartItems]);

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
      {exchangeRates && exchangeRates.tryRate && (
        <div style={{ backgroundColor: '#1a1a1a', color: '#e0e0e0', textAlign: 'center', padding: '5px', fontSize: '13px', letterSpacing: '0.5px' }}>
          1 USD = {exchangeRates.tryRate.toFixed(2)} TRY | {exchangeRates.eur.toFixed(2)} EUR | {exchangeRates.gbp.toFixed(2)} GBP
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

            <div style={{ position: 'relative' }}>
              <Link to="/cart" className="nav-item cart-link" onClick={() => setIsMenuOpen(false)}>
                Cart
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={totalItemsCount}
                    initial={{ scale: 0.8, y: 5 }}
                    animate={{ scale: [1.4, 1], y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="cart-badge"
                  >
                    {totalItemsCount}
                  </motion.span>
                </AnimatePresence>
              </Link>

              <AnimatePresence>
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 15, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                      whiteSpace: 'nowrap',
                      zIndex: 1000,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>✨</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                      {lastItemName} Added!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
