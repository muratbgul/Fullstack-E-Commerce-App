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

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || '';
    const userEmail = getEmailFromToken(storedToken);
    setEmail(userEmail);

    if (userEmail) {
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
  }, []);

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
                onClick={() => window.location.href='/products'}
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
                    <div className="order-status-badge">COMPLETED</div>
                  </div>
                  
                  <div className="order-body-modern">
                    <div className="order-info-item">
                      <span className="info-label">Date Placed</span>
                      <span className="info-value">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="order-info-item">
                      <span className="info-label">Total Amount</span>
                      <span className="price-value-modern">{order.totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span>
                    </div>
                  </div>

                  {/* Yeni sistem (items listesi) varsa onu göster */}
                  {order.items && order.items.length > 0 ? (
                    <div className="order-items-preview">
                      <h4 style={{ marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Items Purchased:</h4>
                      <div className="mini-item-list">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                            <span className="item-name-qty" style={{ fontWeight: '500' }}>{item.productName} (x{item.quantity})</span>
                            <span className="item-price-unit" style={{ color: 'var(--color-text-muted)' }}>{item.priceAtOrder?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL each</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : order.productDetails ? (
                    /* Eski sistem (productDetails string) varsa onu göster */
                    <div className="order-items-preview">
                      <h4 style={{ marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Old System Record:</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        {order.productDetails}
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="order-card-footer">
                    <button className="view-details-btn">View Order Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
