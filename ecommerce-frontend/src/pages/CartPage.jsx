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

  const [toast, setToast] = useState(null);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setToast({ message: 'Sepet boş.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setToast({ message: 'Lütfen önce giriş yapın.', type: 'error' });
      navigate('/login');
      return;
    }

    try {
      // Backend artık tek bir sipariş içerisinde birden fazla ürün bekliyor.
      const response = await fetch('http://localhost:8081/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        })
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH_ERROR');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ödeme sırasında bir hata oluştu.');
      }
      
      setToast({ message: `Siparişiniz başarıyla alındı!`, type: 'success' });
      clearCart();
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) {
      if (err.message === 'AUTH_ERROR') {
        localStorage.removeItem('token');
        clearCart();
        navigate('/login');
      } else {
        setToast({ message: 'Hata: ' + err.message, type: 'error' });
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  return (
    <div>
      <Navbar email={email} />
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
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
                    <div className="item-price">{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL each</div>
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
                <span>{totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span>
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
