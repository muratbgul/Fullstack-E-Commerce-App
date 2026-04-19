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
      const data = await fetchWithAuth('http://localhost:8081/orders/admin');
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusRank = {
    'PENDING': 1,
    'PROCESSING': 2,
    'SHIPPED': 3,
    'DELIVERED': 4,
    'RETURN_REQUESTED': 5,
    'REFUNDED': 6,
    'CANCELLED': 6
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const order = orders.find(o => o.id === id);
    const currentStatus = order?.status || 'PENDING';

    if (statusRank[newStatus] < statusRank[currentStatus]) {
      alert(`Sipariş durumunu '${currentStatus}' halinden '${newStatus}' haline geri döndüremezsiniz.`);
      return;
    }

    try {
      await fetchWithAuth(`http://localhost:8081/orders/${id}/status?status=${newStatus}`, {
        method: 'PUT'
      });
      loadOrders();
    } catch (err) {
      alert('Durum güncellenirken hata oluştu: ' + err.message);
    }
  };

  const handlePartialRefund = async (itemId) => {
    if (!window.confirm("Bu ürünü iade etmek istediğinizden emin misiniz? (Para iadesi gerçekleşecektir)")) return;
    try {
      await fetchWithAuth(`http://localhost:8081/orders/items/${itemId}/refund`, {
        method: 'PUT'
      });
      loadOrders();
    } catch (err) {
      alert('Ürün iade edilirken hata: ' + err.message);
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
            <th>Ship To</th>
            <th>Items</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const currentStatus = o.status || 'PENDING';
            const currentRank = statusRank[currentStatus];

            return (
              <tr key={o.id} className={currentStatus === 'CANCELLED' ? 'row-cancelled' : ''}>
                <td>#{o.id}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>{o.userEmail}</td>
                <td style={{ maxWidth: '200px' }}>
                  <div style={{ fontWeight: '600', color: '#1a202c', fontSize: '0.875rem' }}>{o.buyerFullName || 'N/A'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#718096', margin: '2px 0' }}>{o.buyerPhone}</div>
                  <div style={{ fontSize: '0.75rem', color: '#4a5568', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.buyerAddress}>
                    {o.buyerAddress}
                  </div>
                </td>
                <td className="details-cell">
                  {o.items && o.items.length > 0 ? (
                    o.items.map((item, idx) => (
                      <div key={idx} style={{ 
                        fontSize: '0.8rem', 
                        padding: '4px 0', 
                        borderBottom: idx < o.items.length - 1 ? '1px dashed #edf2f7' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          {item.productName || 'Product'} <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>(x{item.quantity})</span>
                        </div>
                        
                        {item.status === 'REFUNDED' ? (
                          <span style={{ fontSize: '0.7rem', background: '#fef2f2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>REFUNDED</span>
                        ) : (
                          item.status === 'RETURN_REQUESTED' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: '700' }}>RETURN REQ.</span>
                              <button 
                                onClick={() => handlePartialRefund(item.id)}
                                style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Approve Refund
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    ))
                  ) : o.productDetails ? (
                    <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                      {o.productDetails}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <select 
                    className={`status-select-admin ${currentStatus}`}
                    value={currentStatus}
                    onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                    disabled={currentStatus === 'CANCELLED'}
                  >
                    <option value="PENDING" disabled={currentRank > 1}>PENDING</option>
                    <option value="PROCESSING" disabled={currentRank > 2}>PROCESSING</option>
                    <option value="SHIPPED" disabled={currentRank > 3}>SHIPPED</option>
                    <option value="DELIVERED" disabled={currentRank > 4}>DELIVERED</option>
                    
                    {currentStatus === 'REFUNDED' && (
                      <option value="REFUNDED" disabled>REFUNDED</option>
                    )}

                    <option value="CANCELLED" disabled={currentRank > 1 || currentStatus !== 'PENDING'}>CANCELLED</option>
                  </select>
                </td>
                <td className="font-bold">{o.totalPrice ? o.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} USD</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
