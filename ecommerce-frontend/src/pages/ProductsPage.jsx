import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import { useCart } from '../context/CartContext';
import { decodeToken } from '../utils/authUtils';
import { fetchWithAuth } from '../utils/apiUtils';



export default function ProductsPage() {
  const [email, setEmail] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || '';
    const decoded = decodeToken(storedToken);
    if (decoded) {
      setEmail(decoded.email);
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('http://localhost:8081/products');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product);
    }
  };

  return (
    <div>
      <Navbar email={email} />
      <div className="dashboard-page">
        <div className="dashboard-card shadow-lg">
          <div className="page-header-flex">
            <div>
              <h2>Products</h2>
              <div className="product-count">{products.length} Items Available</div>
            </div>
          </div>
          
          {loading && <div className="loading">Searching for the best products...</div>}
          {error && <div className="error">Error: {error}</div>}

          <div className="products-grid">
            {visibleProducts.map(product => (
              <div key={product.id} className={`product-card ${product.stock === 0 ? 'out-of-stock-card' : ''}`}>
                <div className="product-image-mock">📦</div>
                <div className="product-info-modern">
                  <div className="product-name">
                    {product.name}
                    {product.stock > 0 && product.stock <= 3 && (
                      <span className="low-stock-badge">Last {product.stock}!</span>
                    )}
                  </div>
                  <div className="product-price">{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
                  
                  <div className="product-actions-flex">
                    {product.stock > 0 ? (
                      <button className="primary-btn add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </button>
                    ) : (
                      <button className="primary-btn out-of-stock-btn" disabled>
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && !error && products.length > 0 && (
            <div className="pagination-container">
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
