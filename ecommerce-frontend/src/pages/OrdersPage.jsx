import { useEffect, useState } from 'react';
import Navbar from '../Navbar';

function getEmailFromToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return '';
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return payload?.sub || payload?.email || '';
  } catch { return ''; }
}



export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});

  const fetchOrders = () => {
    const storedToken = localStorage.getItem('token') || '';
    const userEmail = getEmailFromToken(storedToken);
    setEmail(userEmail);

    if (userEmail) {
      setLoading(true);
      fetch('http://localhost:8081/orders', {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Siparişler getirilemedi');
          return res.json();
        })
        .then(data => {
          setOrders(data.reverse());
          setLoading(false);
        })
        .catch(err => {
          console.error("Siparişler yüklenirken hata:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bu siparişi iptal etmek istediğinizden emin misiniz?")) return;

    const storedToken = localStorage.getItem('token') || '';
    try {
      const response = await fetch(`http://localhost:8081/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${storedToken}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sipariş iptal edilemedi");
      }
      fetchOrders();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const toggleSelectItem = (orderId, itemId) => {
    setSelectedItems(prev => {
      const currentSelected = prev[orderId] || [];
      if (currentSelected.includes(itemId)) {
        return { ...prev, [orderId]: currentSelected.filter(id => id !== itemId) };
      } else {
        return { ...prev, [orderId]: [...currentSelected, itemId] };
      }
    });
  };

  const handleReturnRequest = async (orderId) => {
    const itemsToReturn = selectedItems[orderId] || [];
    if (itemsToReturn.length === 0) {
      alert("Lütfen iade etmek istediğiniz en az bir ürünü seçin.");
      return;
    }

    if (!window.confirm(`Seçili ${itemsToReturn.length} ürün için iade talebi oluşturmak istediğinizden emin misiniz?`)) return;
    
    const storedToken = localStorage.getItem('token') || '';
    try {
      const response = await fetch(`http://localhost:8081/orders/${orderId}/request-return`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemsToReturn)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "İade talebi oluşturulamadı");
      }
      // Temizle ve yenile
      setSelectedItems(prev => ({ ...prev, [orderId]: [] }));
      fetchOrders();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <Navbar email={email} />
      <div className="dashboard-page" style={{ maxWidth: '900px' }}>
        <div className="page-header-flex">
          <h2>Order History</h2>
          <div className="order-count-badge">{orders.length} Total Orders</div>
        </div>

        {loading ? (
          <div className="loading-state">Fetching your purchase history...</div>
        ) : orders.length === 0 ? (
          <div className="empty-orders-view">
            <div className="empty-icon">📁</div>
            <h3>No orders yet</h3>
            <p>You haven't placed any orders yet. Start shopping and find something you love!</p>
            <button
              className="primary-btn"
              style={{ width: 'auto', marginTop: '20px' }}
              onClick={() => window.location.href = '/products'}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-grid-modern">
            {orders.map(order => (
              <div key={order.id} className="order-card-modern">
                <div className="order-header-modern">
                  <div className="order-id-track">
                    <span className="order-label">ORDER ID</span>
                    <span className="order-number">#{order.id}</span>
                  </div>
                  <div className={`order-status-badge status-${(order.status || 'PENDING').toLowerCase()}`}>
                    {order.status || 'PENDING'}
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className={`order-stepper ${order.status === 'DELIVERED' ? 'delivered-stepper' : ''}`}>
                  <div className={`step ${(order.status === 'PENDING' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED') ? 'active' : ''}`}>
                    <div className="step-dot"></div>
                    <span className="step-label">PENDING</span>
                  </div>
                  <div className={`step ${(order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED') ? 'active' : ''}`}>
                    <div className="step-dot"></div>
                    <span className="step-label">Processing</span>
                  </div>
                  <div className={`step ${(order.status === 'SHIPPED' || order.status === 'DELIVERED') ? 'active' : ''}`}>
                    <div className="step-dot"></div>
                    <span className="step-label">Shipped</span>
                  </div>
                  <div className={`step ${(order.status === 'DELIVERED') ? 'active' : ''}`}>
                    <div className="step-dot"></div>
                    <span className="step-label">Delivered</span>
                  </div>
                </div>

                <div className="order-body-modern">
                  <div className="order-info-item">
                    <span className="info-label">Date Placed</span>
                    <span className="info-value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">Total Amount</span>
                    <span className="price-value-modern">{order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                  </div>
                </div>

                <div className="order-items-preview">
                  <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#1a202c', fontWeight: '700', borderBottom: '1px solid #edf2f7', paddingBottom: '8px' }}>
                    Items Purchased:
                  </h4>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: idx < order.items.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Checkbox only for DELIVERED/PARTIALLY_REFUNDED and PAID items */}
                          {(order.status === 'DELIVERED' || order.status === 'PARTIALLY_REFUNDED' || order.status === 'RETURN_REQUESTED') && item.status === 'PAID' && (
                            <input 
                              type="checkbox" 
                              checked={(selectedItems[order.id] || []).includes(item.id)}
                              onChange={() => toggleSelectItem(order.id, item.id)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#f97316' }}
                            />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{item.productName || 'Product'}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Quantity: {item.quantity}</span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ fontWeight: '700', color: '#334155' }}>
                            {item.priceAtOrder ? item.priceAtOrder.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'} USD
                          </span>
                          
                          {item.status === 'RETURN_REQUESTED' && (
                            <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>RETURN REQUESTED</span>
                          )}
                          {item.status === 'REFUNDED' && (
                            <span style={{ fontSize: '0.7rem', color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>REFUNDED</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : order.productDetails ? (
                    <div className="product-details-text">{order.productDetails}</div>
                  ) : null}
                </div>

                {/* Shipping Details */}
                <div className="order-shipping-details" style={{ marginTop: '15px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Shipping Details:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.875rem' }}>
                    <div className="shipping-info-item">
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Recipient</span>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{order.buyerFullName || 'No Name'}</span>
                    </div>
                    <div className="shipping-info-item">
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Phone</span>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{order.buyerPhone || 'No Phone'}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Delivery Address</span>
                    <span style={{ fontWeight: '500', color: '#334155', lineHeight: '1.4' }}>{order.buyerAddress || 'No Address'}</span>
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="order-total-display">
                    Total: <span className="total-amount">{order.totalPrice ? order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'} USD</span>
                  </div>
                  
                  {order.status === 'PENDING' && (
                    <button
                      className="cancel-order-btn-user"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}

                  {(order.status === 'DELIVERED' || order.status === 'PARTIALLY_REFUNDED' || order.status === 'RETURN_REQUESTED') && 
                   order.items.some(it => it.status === 'PAID') && (
                    <button 
                      className="cancel-order-btn-user" 
                      style={{ 
                        background: (selectedItems[order.id] || []).length > 0 ? '#f97316' : '#cbd5e1', 
                        border: 'none',
                        cursor: (selectedItems[order.id] || []).length > 0 ? 'pointer' : 'not-allowed',
                        color: 'white',
                        fontWeight: '600',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => handleReturnRequest(order.id)}
                      disabled={(selectedItems[order.id] || []).length === 0}
                    >
                      Request Return {(selectedItems[order.id] || []).length > 0 && `(${selectedItems[order.id].length} Items)`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
