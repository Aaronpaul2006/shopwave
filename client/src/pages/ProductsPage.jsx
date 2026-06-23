import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Local inputs states for debouncing
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [minPriceText, setMinPriceText] = useState(searchParams.get('minPrice') || '');
  const [maxPriceText, setMaxPriceText] = useState(searchParams.get('maxPrice') || '');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const currentPage = parseInt(searchParams.get('page')) || 1;

  const [addingProductIds, setAddingProductIds] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Synchronize local search state on URL param changes (like reset)
  useEffect(() => {
    setSearchText(searchParams.get('search') || '');
    setMinPriceText(searchParams.get('minPrice') || '');
    setMaxPriceText(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  // Debounce search text updates to URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (searchText === urlSearch) return;

    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchText) {
        newParams.set('search', searchText);
      } else {
        newParams.delete('search');
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Debounce minPrice updates
  useEffect(() => {
    const urlMin = searchParams.get('minPrice') || '';
    if (minPriceText === urlMin) return;

    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (minPriceText) {
        newParams.set('minPrice', minPriceText);
      } else {
        newParams.delete('minPrice');
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    }, 400);

    return () => clearTimeout(timer);
  }, [minPriceText]);

  // Debounce maxPrice updates
  useEffect(() => {
    const urlMax = searchParams.get('maxPrice') || '';
    if (maxPriceText === urlMax) return;

    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (maxPriceText) {
        newParams.set('maxPrice', maxPriceText);
      } else {
        newParams.delete('maxPrice');
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    }, 400);

    return () => clearTimeout(timer);
  }, [maxPriceText]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryStr = searchParams.toString();
        const res = await fetch(`${API_URL}/api/products?${queryStr}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
          setTotalCount(data.totalCount);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handleCategoryChange = (category, isChecked) => {
    const newParams = new URLSearchParams(searchParams);
    const selected = newParams.getAll('category');
    
    newParams.delete('category');
    
    if (isChecked) {
      [...selected, category].forEach(c => newParams.append('category', c));
    } else {
      selected.filter(c => c !== category).forEach(c => newParams.append('category', c));
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (pageNum) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNum.toString());
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchText('');
    setMinPriceText('');
    setMaxPriceText('');
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (res.ok) {
        setAddingProductIds(prev => ({ ...prev, [productId]: true }));
        setTimeout(() => {
          setAddingProductIds(prev => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
        }, 1500);
      } else {
        alert('Could not add to cart');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding item to cart');
    }
  };

  const categoriesList = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
  const activeCategories = searchParams.getAll('category');

  const paginationPages = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationPages.push(i);
  }

  // Inline premium CSS styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #0f0f1c 100%)',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      color: '#f8fafc',
      padding: '40px 20px',
      boxSizing: 'border-box'
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      gap: '32px'
    },
    sidebar: {
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      height: 'fit-content',
      boxSizing: 'border-box'
    },
    filterTitle: {
      fontSize: '18px',
      fontWeight: '700',
      margin: '0',
      color: '#38bdf8'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#94a3b8',
      margin: '0 0 12px 0'
    },
    searchGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    searchInput: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px solid #334155',
      background: '#090d16',
      color: '#f8fafc',
      fontSize: '14px',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box'
    },
    checkboxGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      color: '#cbd5e1'
    },
    checkbox: {
      cursor: 'pointer',
      accentColor: '#38bdf8'
    },
    priceGroup: {
      display: 'flex',
      gap: '8px'
    },
    priceInput: {
      width: '50%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid #334155',
      background: '#090d16',
      color: '#f8fafc',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    clearButton: {
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid rgba(248, 113, 113, 0.2)',
      background: 'rgba(248, 113, 113, 0.1)',
      color: '#f87171',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    productsArea: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '24px'
    },
    card: {
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      position: 'relative'
    },
    image: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderRadius: '12px'
    },
    categoryBadge: {
      padding: '3px 8px',
      background: 'rgba(56, 189, 248, 0.1)',
      color: '#38bdf8',
      fontSize: '11px',
      fontWeight: '600',
      borderRadius: '20px',
      width: 'fit-content',
      textTransform: 'uppercase'
    },
    name: {
      fontSize: '16px',
      fontWeight: '600',
      margin: '0',
      color: '#f8fafc',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '14px',
      color: '#fbbf24',
      fontWeight: '600'
    },
    priceStockRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    price: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#f8fafc'
    },
    stockBadge: (stock) => ({
      padding: '3px 8px',
      background: stock > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      color: stock > 0 ? '#4ade80' : '#f87171',
      fontSize: '11px',
      fontWeight: '600',
      borderRadius: '20px'
    }),
    addButton: (disabled) => ({
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      background: disabled ? '#334155' : 'linear-gradient(to right, #2563eb, #4f46e5)',
      color: disabled ? '#94a3b8' : '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'opacity 0.2s'
    }),
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '20px'
    },
    pageButton: (active, disabled) => ({
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      background: active ? '#2563eb' : 'rgba(30, 41, 59, 0.5)',
      color: disabled ? '#64748b' : '#f8fafc',
      fontSize: '14px',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer'
    })
  };

  // Skeleton pulsing keyframes style injection
  const injectStyle = `
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.25; }
    }
    .skeleton-pulse {
      animation: pulse 1.5s infinite ease-in-out;
      background-color: #1e293b;
      border-radius: 12px;
    }
    @media (max-width: 768px) {
      .products-layout-wrapper {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{injectStyle}</style>
      <div className="products-layout-wrapper" style={styles.wrapper}>
        
        {/* Sidebar filters */}
        <div style={styles.sidebar}>
          <h3 style={styles.filterTitle}>Filters</h3>
          
          {/* Search text filter */}
          <div style={styles.searchGroup}>
            <h4 style={styles.sectionTitle}>Search</h4>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search products..."
              style={styles.searchInput}
            />
          </div>

          {/* Category filter */}
          <div>
            <h4 style={styles.sectionTitle}>Categories</h4>
            <div style={styles.checkboxGroup}>
              {categoriesList.map((cat) => (
                <label key={cat} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={activeCategories.includes(cat)}
                    onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                    style={styles.checkbox}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range filter */}
          <div>
            <h4 style={styles.sectionTitle}>Price Range</h4>
            <div style={styles.priceGroup}>
              <input
                type="number"
                value={minPriceText}
                onChange={(e) => setMinPriceText(e.target.value)}
                placeholder="Min"
                style={styles.priceInput}
              />
              <input
                type="number"
                value={maxPriceText}
                onChange={(e) => setMaxPriceText(e.target.value)}
                placeholder="Max"
                style={styles.priceInput}
              />
            </div>
          </div>

          {/* Reset button */}
          <button onClick={clearFilters} style={styles.clearButton}>
            Clear Filters
          </button>
        </div>

        {/* Product grid */}
        <div style={styles.productsArea}>
          {loading ? (
            // Skeleton Loader (12 Cards)
            <div style={styles.grid}>
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} style={styles.card}>
                  <div className="skeleton-pulse" style={{ width: '100%', height: '200px' }} />
                  <div className="skeleton-pulse" style={{ width: '40%', height: '16px', marginTop: '8px' }} />
                  <div className="skeleton-pulse" style={{ width: '80%', height: '20px', marginTop: '8px' }} />
                  <div className="skeleton-pulse" style={{ width: '30%', height: '16px', marginTop: '8px' }} />
                  <div className="skeleton-pulse" style={{ width: '100%', height: '36px', marginTop: '12px' }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '18px', color: '#94a3b8' }}>
              No products found matching filters.
            </div>
          ) : (
            // Product Cards Display
            <div style={styles.grid}>
              {products.map((product) => {
                const isOutOfStock = product.stock === 0;
                const isAdded = !!addingProductIds[product._id];
                return (
                  <div key={product._id} style={styles.card}>
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/200'}
                      alt={product.name}
                      style={styles.image}
                    />
                    <div style={styles.categoryBadge}>{product.category}</div>
                    <h3 style={styles.name} title={product.name}>
                      {product.name}
                    </h3>
                    <div style={styles.ratingRow}>
                      {(product.avgRating || 0).toFixed(1)} ★
                    </div>
                    <div style={styles.priceStockRow}>
                      <span style={styles.price}>
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </span>
                      <span style={styles.stockBadge(product.stock)}>
                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      disabled={isOutOfStock}
                      style={styles.addButton(isOutOfStock)}
                    >
                      {isAdded ? 'Added!' : 'Add to Cart'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                style={styles.pageButton(false, currentPage === 1)}
              >
                Prev
              </button>
              {paginationPages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={styles.pageButton(page === currentPage, false)}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={styles.pageButton(false, currentPage === totalPages)}
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductsPage;
