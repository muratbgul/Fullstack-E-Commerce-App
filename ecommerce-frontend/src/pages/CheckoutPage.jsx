import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  User,
  MapPin
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import confetti from 'canvas-confetti';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [cardData, setCardData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });

  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    surname: '',
    phone: '',
    address: ''
  });

  const [buyerErrors, setBuyerErrors] = useState({});
  const [focused, setFocused] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setProfileLoading(false); return; }

    fetch('http://localhost:8081/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setBuyerInfo({
            name: data.name || '',
            surname: data.surname || '',
            phone: data.phone || '',
            address: data.address || ''
          });
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const handleBuyerChange = (e) => {
    const { name, value } = e.target;
    setBuyerInfo(prev => ({ ...prev, [name]: value }));
    if (buyerErrors[name]) {
      setBuyerErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateBuyerInfo = () => {
    const errors = {};
    if (!buyerInfo.name.trim()) errors.name = 'Ad zorunludur';
    if (!buyerInfo.surname.trim()) errors.surname = 'Soyad zorunludur';
    if (!buyerInfo.phone.trim()) errors.phone = 'Telefon numarası zorunludur';
    if (!buyerInfo.address.trim()) errors.address = 'Teslimat adresi zorunludur';
    return errors;
  };

  const missingFields = Object.values(buyerInfo).some(v => !v.trim());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const parts = [];
      for (let i = 0; i < formattedValue.length; i += 4) {
        parts.push(formattedValue.substring(i, i + 4));
      }
      setCardData({ ...cardData, [name]: parts.join(' ').substring(0, 19) });
    } else if (name === 'cvc') {
      setCardData({ ...cardData, [name]: value.substring(0, 3).replace(/[^0-9]/gi, '') });
    } else if (name === 'expireMonth' || name === 'expireYear') {
      setCardData({ ...cardData, [name]: value.substring(0, 2).replace(/[^0-9]/gi, '') });
    } else {
      setCardData({ ...cardData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateBuyerInfo();
    if (Object.keys(errors).length > 0) {
      setBuyerErrors(errors);
      setError('Lütfen tüm alıcı bilgilerini doldurun.');
      return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first.');
      setLoading(false);
      return;
    }

    const orderRequest = {
      paymentCard: {
        ...cardData,
        cardNumber: cardData.cardNumber.replace(/\s/g, '')
      },
      buyerInfo: buyerInfo,
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch('http://localhost:8081/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderRequest)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899']
        });
        setTimeout(() => {
          clearCart();
          navigate('/orders');
        }, 3500);
      } else {
        setError(data.message || 'An error occurred during the payment processing.');
      }
    } catch (err) {
      setError('Could not connect to server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !success) {
    return (
      <div className="empty-cart-container" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
          <ShoppingBag size={80} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
          <h2 className="section-title">Your Cart is Empty</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>You must add products to your cart before proceeding to checkout.</p>
          <button onClick={() => navigate('/')} className="submit-button" style={{ width: 'auto', padding: '1rem 2rem' }}>
            Start Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <motion.button 
        whileHover={{ x: -4 }}
        onClick={() => navigate('/cart')}
        className="back-button"
      >
        <ArrowLeft size={18} />
        Back to Cart
      </motion.button>

      <div className="checkout-grid">
        <div className="order-summary-section">
          <h2 className="section-title">Order Summary</h2>
          <div className="summary-card">
            <div className="cart-items-container">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div className="item-img-wrapper">
                    <div className="item-image-mock-small">📦</div>
                    <span className="item-badge">{item.quantity}</span>
                  </div>
                  <div className="item-info">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-price-unit">Unit: {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</p>
                  </div>
                  <p className="item-total">
                    {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </p>
                </div>
              ))}
            </div>
            
            <div className="summary-footer">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Free</span>
              </div>
              <div className="summary-row total-row">
                <span className="total-label">Total</span>
                <span className="total-amount">
                  {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>
          </div>

          {/* Buyer Information — under Order Summary */}
          <div className="buyer-info-section">
            <div className="buyer-info-header">
              <User size={16} />
              <span>Delivery Information</span>
              <a href="/profile" className="buyer-edit-link">Edit Profile →</a>
            </div>

            {missingFields && (
              <div className="buyer-warning-banner">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>Some profile fields are missing. Please fill in the fields below to continue.</span>
              </div>
            )}

            <div className="buyer-grid">
              <div className="input-group">
                <label>First Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={buyerInfo.name}
                  onChange={handleBuyerChange}
                  placeholder="Your first name"
                  className={`form-input ${buyerErrors.name ? 'input-error' : ''}`}
                />
                {buyerErrors.name && <span className="field-error">{buyerErrors.name}</span>}
              </div>

              <div className="input-group">
                <label>Last Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="surname"
                  value={buyerInfo.surname}
                  onChange={handleBuyerChange}
                  placeholder="Your last name"
                  className={`form-input ${buyerErrors.surname ? 'input-error' : ''}`}
                />
                {buyerErrors.surname && <span className="field-error">{buyerErrors.surname}</span>}
              </div>
            </div>

            <div className="input-group">
              <label>Phone <span className="required-star">*</span></label>
              <input
                type="text"
                name="phone"
                value={buyerInfo.phone}
                onChange={handleBuyerChange}
                placeholder="+90 5XX XXX XX XX"
                className={`form-input ${buyerErrors.phone ? 'input-error' : ''}`}
              />
              {buyerErrors.phone && <span className="field-error">{buyerErrors.phone}</span>}
            </div>

            <div className="input-group">
              <label><MapPin size={13} style={{ marginRight: 4 }} />Delivery Address <span className="required-star">*</span></label>
              <textarea
                name="address"
                value={buyerInfo.address}
                onChange={handleBuyerChange}
                placeholder="Street, building no, district, city"
                rows={3}
                className={`form-input ${buyerErrors.address ? 'input-error' : ''}`}
                style={{ resize: 'vertical', minHeight: '72px' }}
              />
              {buyerErrors.address && <span className="field-error">{buyerErrors.address}</span>}
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="payment-section"
        >
          <div className="card-wrapper">
            <div className={`card-inner ${focused === 'cvc' ? 'flipped' : ''}`}>
              <div className="card-front">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div className="chip"></div>
                  <CreditCard size={36} opacity={0.7} />
                </div>
                <div className="card-number-display">
                  {cardData.cardNumber || "•••• •••• •••• ••••"}
                </div>
                <div className="card-holder-info">
                  <div style={{ maxWidth: '70%' }}>
                    <p className="info-label">Card Holder</p>
                    <p className="info-value truncate">{cardData.cardHolderName || "FULL NAME"}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="info-label">Expiration</p>
                    <p className="info-value">{cardData.expireMonth || "MM"}/{cardData.expireYear || "YY"}</p>
                  </div>
                </div>
              </div>
              <div className="card-back">
                <div className="black-bar"></div>
                <div style={{ padding: '0 2rem' }}>
                    <p className="info-label">CVC / CVV</p>
                    <div className="cvv-display">{cardData.cvc || "•••"}</div>
                </div>
                <p style={{ fontSize: '7px', opacity: 0.3, padding: '1rem 2rem', fontStyle: 'italic' }}>
                    PROTECTED BY BANK GRADE ENCRYPTION. IYZICO SANDBOX TEST CARD ONLY.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">

            <div className="payment-divider">
              <CreditCard size={14} />
              <span>Card Details</span>
            </div>

            <div className="input-group">
              <label>Card Holder Name</label>
              <input 
                type="text" 
                name="cardHolderName"
                placeholder="e.g. John Doe"
                required
                className="form-input"
                value={cardData.cardHolderName}
                onChange={handleInputChange}
                onFocus={() => setFocused('cardHolderName')}
                autoComplete="cc-name"
              />
            </div>

            <div className="input-group">
              <label>Card Number</label>
              <input 
                type="text" 
                name="cardNumber"
                placeholder="0000 0000 0000 0000"
                required
                className="form-input"
                style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
                value={cardData.cardNumber}
                onChange={handleInputChange}
                onFocus={() => setFocused('cardNumber')}
                autoComplete="cc-number"
              />
            </div>

            <div className="grid-3-cols">
              <div className="input-group">
                <label>Month</label>
                <input 
                  type="text" 
                  name="expireMonth"
                  placeholder="MM"
                  required
                  className="form-input text-center"
                  value={cardData.expireMonth}
                  onChange={handleInputChange}
                  onFocus={() => setFocused('expireMonth')}
                />
              </div>
              <div className="input-group">
                <label>Year</label>
                <input 
                  type="text" 
                  name="expireYear"
                  placeholder="YY"
                  required
                  className="form-input text-center"
                  value={cardData.expireYear}
                  onChange={handleInputChange}
                  onFocus={() => setFocused('expireYear')}
                />
              </div>
              <div className="input-group">
                <label>CVC</label>
                <input 
                  type="text" 
                  name="cvc"
                  placeholder="•••"
                  required
                  className="form-input text-center"
                  value={cardData.cvc}
                  onChange={handleInputChange}
                  onFocus={() => setFocused('cvc')}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="error-msg"
                >
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="success-msg"
                >
                  <CheckCircle2 size={48} color="#22c55e" />
                  <h3 style={{ margin: '0.5rem 0 0.25rem', fontWeight: 800 }}>Order Successful!</h3>
                  <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>Payment approved. Redirecting to your orders...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!success && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || profileLoading}
                className="submit-button"
                title={missingFields ? 'Lütfen tüm alıcı bilgilerini doldurun' : ''}
              >
                {loading ? (
                  <div className="loader"></div>
                ) : (
                  <>
                    Complete Payment
                    <ChevronRight size={20} />
                  </>
                )}
              </motion.button>
            )}

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.85rem', color: '#475569' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>🛠️ Sandbox Test Cards</p>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><strong>Valid Card:</strong></span> <code style={{ userSelect: 'all', background: '#dcfce7', color: '#166534', padding: '2px 4px', borderRadius: '4px' }}>5890 0400 0000 0016</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><strong>Insufficient Funds:</strong></span> <code style={{ userSelect: 'all', background: '#fee2e2', color: '#dc2626', padding: '2px 4px', borderRadius: '4px' }}>4111 1111 1111 1129</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><strong>Expired Card:</strong></span> <code style={{ userSelect: 'all', background: '#fee2e2', color: '#dc2626', padding: '2px 4px', borderRadius: '4px' }}>4125 1111 1111 1115</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><strong>Invalid CVC:</strong></span> <code style={{ userSelect: 'all', background: '#fee2e2', color: '#dc2626', padding: '2px 4px', borderRadius: '4px' }}>4124 1111 1111 1116</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><strong>Bank Declined:</strong></span> <code style={{ userSelect: 'all', background: '#fee2e2', color: '#dc2626', padding: '2px 4px', borderRadius: '4px' }}>4129 1111 1111 1111</code>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <p><strong>Month/Year:</strong> Any future date (e.g., <code>12</code>/<code>25</code>)</p>
                  <p><strong>CVC:</strong> Any 3 digits (e.g., <code>123</code>)</p>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
