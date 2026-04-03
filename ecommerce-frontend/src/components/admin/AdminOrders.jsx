import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/apiUtils';



export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('http://localhost:8081/orders');
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm(`Sipariş #${id} iptal edilsin mi?`)) return;
    try {
      await fetchWithAuth(`http://localhost:8081/orders/${id}/cancel`, {
        method: 'PUT'
      });
      loadOrders();
    } catch (err) {
      alert('Sipariş iptal edilirken hata oluştu: ' + err.message);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="admin-content-section">
      <div className="admin-header">
        <h3>Order Management</h3>
        <div className="order-stats">Total Orders: {orders.length}</div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Email</th>
            <th>Details</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const currentStatus = o.status || 'ACTIVE';
            return (
              <tr key={o.id} className={currentStatus === 'CANCELLED' ? 'row-cancelled' : ''}>
                <td>#{o.id}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>{o.userEmail}</td>
                <td className="details-cell">
                  {o.items && o.items.length > 0 ? (
                    o.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', padding: '2px 0' }}>
                        {item.productName || 'Product'} <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>(x{item.quantity})</span>
                      </div>
                    ))
                  ) : o.productDetails ? (
                    <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                      {o.productDetails}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <span className={`status-badge ${currentStatus}`}>
                    {currentStatus}
                  </span>
                </td>
                <td className="font-bold">{o.totalPrice ? o.totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} TL</td>
                <td>
                  {currentStatus === 'ACTIVE' && (
                    <button className="secondary-btn btn-xs cancel-btn" onClick={() => handleCancelOrder(o.id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
