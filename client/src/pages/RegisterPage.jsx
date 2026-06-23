import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setGeneralError('');
    setErrors({});
    if (!validate()) {
      return;
    }

    setIsPending(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token, data.user);
        navigate('/', { replace: true });
      } else if (response.status === 409) {
        setErrors({ email: 'Email already registered' });
      } else {
        setGeneralError('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setGeneralError('Something went wrong. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Inline CSS Styles matching the login view
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      color: '#f8fafc',
      padding: '20px',
      boxSizing: 'border-box'
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      background: 'rgba(30, 41, 59, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '36px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxSizing: 'border-box'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      textAlign: 'center',
      margin: '0',
      background: 'linear-gradient(to right, #38bdf8, #818cf8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#94a3b8',
      textAlign: 'center',
      margin: '-10px 0 5px 0'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
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
      background: '#0f172a',
      color: '#f8fafc',
      fontSize: '15px',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    button: {
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(to right, #2563eb, #4f46e5)',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: isPending ? 'not-allowed' : 'pointer',
      opacity: isPending ? 0.7 : 1,
      transition: 'opacity 0.2s',
      marginTop: '8px',
      outline: 'none',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
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
    linkText: {
      fontSize: '14px',
      color: '#94a3b8',
      textAlign: 'center',
      margin: '8px 0 0 0'
    },
    link: {
      color: '#38bdf8',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'color 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Sign up to get started today</p>

        {generalError && <div style={styles.generalError}>{generalError}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="John Doe"
            style={styles.input}
          />
          {errors.name && <div style={styles.fieldError}>{errors.name}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="name@example.com"
            style={styles.input}
          />
          {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            style={styles.input}
          />
          {errors.password && <div style={styles.fieldError}>{errors.password}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            style={styles.input}
          />
          {errors.confirmPassword && (
            <div style={styles.fieldError}>{errors.confirmPassword}</div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          style={styles.button}
        >
          {isPending ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p style={styles.linkText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
