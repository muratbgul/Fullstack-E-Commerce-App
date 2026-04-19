import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import { useCart } from '../context/CartContext';
import { getEmailFromToken } from '../utils/authUtils';



export default function CartPage() {
  const [email, setEmail] = useState('');
  const { cartItems, totalPrice, clearCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || '';
    setEmail(getEmailFromToken(storedToken));
  }, []);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }
    navigate('/checkout');
  };

  return (
    <div>
      <Navbar email={email} />
      <div className="dashboard-page">
        <div className="page-header-flex">
          <h2>Your Shopping Cart</h2>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>Looks like you haven't added anything to your cart yet.</p>
            <button
              className="primary-btn"
              style={{ width: 'auto' }}
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item-modern">
                  <div className="item-image-mock">📦</div>

                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">{item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD each</div>
                  </div>

                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>

                    <button className="remove-btn" title="Remove" onClick={() => removeFromCart(item.id)}>
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-card">
              <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Order Summary</h3>
              <div className="summary-row">
                <span>Items</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: 'var(--color-success)' }}>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
              </div>
              <button
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Complete Purchase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
