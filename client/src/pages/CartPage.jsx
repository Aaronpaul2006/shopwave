import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const CartPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data.cart);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  // Optimistic quantity updates & API synchronization
  const handleUpdateQuantity = async (productId, newQty) => {
    if (!cart) return;

    const prevCart = { ...cart };

    // Optimistically update local cart state immediately
    setCart((prev) => {
      const nextItems = prev.items
        .map((item) => {
          if (item.product._id === productId) {
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
      return { ...prev, items: nextItems };
    });

    try {
      let res;
      if (newQty <= 0) {
        // DELETE remove
        res = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // PUT update
        res = await fetch(`${API_URL}/api/cart/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity: newQty })
        });
      }

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      setCart(data.cart);
    } catch (err) {
      console.error(err);
      // Revert back on error
      setCart(prevCart);
      alert('Could not update cart quantity. Reverting changes.');
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.product ? Number(item.product.price) : 0;
      return sum + price * item.quantity;
    }, 0);
  };

  // Inline premium styling
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
      maxWidth: '1000px',
      margin: '0 auto'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '32px',
      background: 'linear-gradient(to right, #38bdf8, #818cf8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 340px',
      gap: '32px',
      alignItems: 'start'
    },
    itemsCard: {
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    itemRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      paddingBottom: '20px',
      gap: '16px'
    },
    itemInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flex: 1
    },
    image: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '8px'
    },
    itemName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#f8fafc',
      margin: '0 0 4px 0'
    },
    itemPrice: {
      fontSize: '14px',
      color: '#94a3b8'
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    qtyBtn: {
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      border: '1px solid #475569',
      background: '#1e293b',
      color: '#f8fafc',
      fontSize: '16px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      outline: 'none'
    },
    qtyNum: {
      fontSize: '15px',
      fontWeight: '600',
      minWidth: '20px',
      textAlign: 'center'
    },
    summaryCard: {
      background: 'rgba(30, 41, 59, 0.65)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    summaryTitle: {
      fontSize: '18px',
      fontWeight: '700',
      margin: '0',
      color: '#38bdf8'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '15px',
      color: '#cbd5e1'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '18px',
      fontWeight: '700',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingTop: '16px',
      color: '#f8fafc'
    },
    checkoutBtn: {
      width: '100%',
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(to right, #2563eb, #4f46e5)',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
    },
    emptyContainer: {
      textAlign: 'center',
      padding: '60px 20px',
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px'
    },
    emptyText: {
      fontSize: '18px',
      color: '#94a3b8',
      marginBottom: '20px'
    },
    browseLink: {
      display: 'inline-block',
      padding: '12px 24px',
      borderRadius: '8px',
      background: 'linear-gradient(to right, #2563eb, #4f46e5)',
      color: '#ffffff',
      fontSize: '15px',
      fontWeight: '600',
      textDecoration: 'none'
    }
  };

  const injectStyles = `
    @media (max-width: 768px) {
      .cart-grid-wrapper {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '18px' }}>Loading cart...</div>
      </div>
    );
  }

  const isCartEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div style={styles.container}>
      <style>{injectStyles}</style>
      <div style={styles.wrapper}>
        <h2 style={styles.title}>Shopping Cart</h2>

        {isCartEmpty ? (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyText}>Your cart is empty</p>
            <Link to="/products" style={styles.browseLink}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="cart-grid-wrapper" style={styles.grid}>
            {/* Cart Items list */}
            <div style={styles.itemsCard}>
              {cart.items.map((item) => {
                if (!item.product) return null;
                return (
                  <div key={item.product._id} style={styles.itemRow}>
                    <div style={styles.itemInfo}>
                      <img
                        src={item.product.imageUrl || 'https://via.placeholder.com/60'}
                        alt={item.product.name}
                        style={styles.image}
                      />
                      <div>
                        <h4 style={styles.itemName}>{item.product.name}</h4>
                        <span style={styles.itemPrice}>
                          ₹{Number(item.product.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div style={styles.controls}>
                      <button
                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                        style={styles.qtyBtn}
                      >
                        -
                      </button>
                      <span style={styles.qtyNum}>{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                        style={styles.qtyBtn}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary card */}
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>

              {cart.items.map((item) => {
                if (!item.product) return null;
                return (
                  <div key={item.product._id} style={styles.summaryRow}>
                    <span>
                      {item.product.name} (x{item.quantity})
                    </span>
                    <span>
                      ₹{(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}

              <div style={styles.totalRow}>
                <span>Total</span>
                <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                style={styles.checkoutBtn}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
