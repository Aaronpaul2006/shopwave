import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useAuth from '../hooks/useAuth';

// Initialize loadStripe promise using VITE_STRIPE_PUBLIC_KEY env variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const CheckoutForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [cardError, setCardError] = useState('');
  const [isPending, setIsPending] = useState(false);

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
          
          // If cart is empty, redirect back to cart page
          if (!data.cart || !data.cart.items || data.cart.items.length === 0) {
            navigate('/cart', { replace: true });
          }
        }
      } catch (err) {
        console.error('Error fetching checkout cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    setGeneralError('');
    setCardError('');
    setErrors({});

    if (!validate()) {
      return;
    }

    if (!stripe || !elements) {
      setGeneralError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsPending(true);

    try {
      const totalPrice = calculateTotal();
      const amountInPaise = Math.round(totalPrice * 100);

      // 1. POST to /api/payment/create-intent
      const intentRes = await fetch(`${API_URL}/api/payment/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: amountInPaise })
      });

      if (!intentRes.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await intentRes.json();

      // 2. confirmCardPayment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: fullName,
            address: {
              line1: streetAddress,
              city: city,
              postal_code: postalCode,
              country: 'IN'
            }
          }
        }
      });

      if (stripeError) {
        setCardError(stripeError.message);
        setIsPending(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // 3. POST /api/orders/create with payment details
        const orderRes = await fetch(`${API_URL}/api/orders/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            shippingAddress: {
              name: fullName,
              street: streetAddress,
              city,
              postalCode,
              country
            },
            paymentIntentId: paymentIntent.id
          })
        });

        if (orderRes.status === 201) {
          const data = await orderRes.json();
          navigate('/orders', { state: { newOrderId: data.order._id } });
        } else {
          setGeneralError('Order failed, please try again');
        }
      } else {
        setGeneralError('Payment was not completed successfully');
      }
    } catch (err) {
      console.error(err);
      setGeneralError('Order failed, please try again');
    } finally {
      setIsPending(false);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.product ? Number(item.product.price) : 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#f8fafc',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#64748b'
        }
      },
      invalid: {
        color: '#f87171',
        iconColor: '#f87171'
      }
    }
  };

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
      gridTemplateColumns: '1fr 360px',
      gap: '32px',
      alignItems: 'start'
    },
    card: {
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxSizing: 'border-box'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#38bdf8',
      margin: '0 0 8px 0'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #334155',
      background: '#090d16',
      color: '#f8fafc',
      fontSize: '15px',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box'
    },
    cardContainer: {
      padding: '14px 16px',
      borderRadius: '8px',
      border: '1px solid #334155',
      background: '#090d16',
      boxSizing: 'border-box',
      marginTop: '6px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    fieldError: {
      color: '#f87171',
      fontSize: '12px',
      marginTop: '2px',
      fontWeight: '500'
    },
    generalError: {
      color: '#f87171',
      fontSize: '14px',
      textAlign: 'center',
      background: 'rgba(248, 113, 113, 0.1)',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid rgba(248, 113, 113, 0.2)'
    },
    summaryCard: {
      background: 'rgba(30, 41, 59, 0.65)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxSizing: 'border-box'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
      color: '#cbd5e1'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '18px',
      fontWeight: '700',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingTop: '16px',
      color: '#f8fafc'
    },
    placeOrderBtn: {
      width: '100%',
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      background: isPending ? '#334155' : 'linear-gradient(to right, #22c55e, #16a34a)',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: isPending ? 'not-allowed' : 'pointer',
      opacity: isPending ? 0.8 : 1,
      transition: 'opacity 0.2s',
      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
      marginTop: '12px'
    }
  };

  const injectStyles = `
    @media (max-width: 768px) {
      .checkout-grid-wrapper {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '18px' }}>Loading checkout...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{injectStyles}</style>
      <div style={styles.wrapper}>
        <h2 style={styles.title}>Checkout</h2>

        <div className="checkout-grid-wrapper" style={styles.grid}>
          {/* Shipping Form */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Shipping Address</h3>
            
            {generalError && <div style={styles.generalError}>{generalError}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                style={styles.input}
              />
              {errors.fullName && <div style={styles.fieldError}>{errors.fullName}</div>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Street Address</label>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="123 Main St, Apt 4B"
                style={styles.input}
              />
              {errors.streetAddress && <div style={styles.fieldError}>{errors.streetAddress}</div>}
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  style={styles.input}
                />
                {errors.city && <div style={styles.fieldError}>{errors.city}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="10001"
                  style={styles.input}
                />
                {errors.postalCode && <div style={styles.fieldError}>{errors.postalCode}</div>}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United States"
                style={styles.input}
              />
              {errors.country && <div style={styles.fieldError}>{errors.country}</div>}
            </div>

            {/* Stripe Card Element */}
            <div style={{ ...styles.inputGroup, marginTop: '12px' }}>
              <label style={styles.label}>Card Information</label>
              <div style={styles.cardContainer}>
                <CardElement options={cardElementOptions} />
              </div>
              {cardError && <div style={styles.fieldError}>{cardError}</div>}
            </div>
          </div>

          {/* Right Side Summary */}
          <div style={styles.summaryCard}>
            <h3 style={styles.sectionTitle}>Summary</h3>
            
            {cart && cart.items && cart.items.map((item) => {
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
              onClick={handlePlaceOrder}
              disabled={isPending}
              style={styles.placeOrderBtn}
            >
              {isPending ? 'Processing Payment...' : 'Place Order & Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;
