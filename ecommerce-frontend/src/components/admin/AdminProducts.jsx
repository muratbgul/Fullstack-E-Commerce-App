import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/apiUtils';



export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: 0 });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('http://localhost:8081/products/admin');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', stock: 0 });
    setShowForm(false);
    setEditMode(false);
    setCurrentProductId(null);
  };

  const handleEdit = (product) => {
    setFormData({ name: product.name, price: product.price, stock: product.stock || 0 });
    setCurrentProductId(product.id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await fetchWithAuth(`http://localhost:8081/products/${currentProductId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchWithAuth('http://localhost:8081/products', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      resetForm();
      loadProducts();
    } catch (err) {
      alert('Ürün kaydedilirken hata: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await fetchWithAuth(`http://localhost:8081/products/${id}`, {
        method: 'DELETE'
      });
      loadProducts();
    } catch (err) {
      alert('Ürün silinirken hata: ' + err.message);
    }
  };

  return (
    <div className="admin-content-section">
      <div className="admin-header">
        <h3>Product Management</h3>
        {!showForm && (
          <button className="primary-btn add-btn" onClick={() => setShowForm(true)}>
            + New Product
          </button>
        )}
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h4 style={{ marginBottom: '16px' }}>{editMode ? 'Edit Product' : 'Add New Product'}</h4>
          <div className="form-grid-modern" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="input-group-modern">
               <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Product Name</label>
               <input 
                type="text" 
                placeholder="Ex: iPhone 15" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
               />
            </div>
            <div className="input-group-modern">
               <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Price (USD)</label>
               <input 
                type="number" 
                step="0.01" 
                placeholder="1000.00" 
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
               />
            </div>
            <div className="input-group-modern">
               <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Stock Quantity</label>
               <input 
                type="number" 
                placeholder="50" 
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
               />
            </div>
          </div>
          <div className="form-actions-modern" style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="primary-btn">Save Product</button>
            <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      {error && <div className="error-box">{error}</div>}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading products...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className={p.status === 'DELETED' ? 'row-deleted-product' : ''}>
                <td>{p.id}</td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td>{p.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</td>
                <td>
                  <span className={`stock-badge ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {p.stock} units
                  </span>
                </td>
                <td>
                  <span className={`product-status-badge ${p.status || 'ACTIVE'}`}>
                    {p.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="admin-table-actions">
                  <button 
                    className="edit-mini" 
                    onClick={() => handleEdit(p)}
                    disabled={p.status === 'DELETED'}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-mini" 
                    onClick={() => handleDelete(p.id)}
                    disabled={p.status === 'DELETED'}
                    style={{ opacity: p.status === 'DELETED' ? 0.3 : 1 }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
