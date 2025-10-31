import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiCheck, FiTruck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Checkout.css';

const Checkout = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, []);

  // Check user authentication
  useEffect(() => {
    if (!user) {
      alert('Please login to place an order');
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Validate cart items
    const invalidItems = cart.filter(item => !item || !item.product || !item.product._id);
    if (invalidItems.length > 0) {
      console.error('Invalid cart items found:', invalidItems);
      alert('Some items in your cart are invalid. Please refresh and try again.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      console.log('🛒 Placing order...');
      console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('Token length:', token ? token.length : 0);
      console.log('Token type:', typeof token);
      
      if (!token) {
        alert('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          name: item.product.name || 'Unknown Product',
          price: item.product.price || 0,
          quantity: item.quantity || 1,
          size: item.size || 'M',
          color: item.color || 'Default',
          image: item.product.images?.[0] || 'https://via.placeholder.com/150'
        })),
        totalAmount: Math.round(getCartTotal() * 1.18),
        paymentMethod: 'cod'
      };

      console.log('📦 Order data:', orderData);

      const response = await api.post('/orders', orderData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Order response:', response.data);

      if (response.data.success) {
        setOrderSuccess(true);
        clearCart();
        
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Order placement error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response?.status === 400) {
        alert(error.response?.data?.message || 'Invalid order data');
      } else {
        alert('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Success Animation
  if (orderSuccess) {
    return (
      <div style={styles.successContainer}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          style={styles.successCard}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.3, type: 'spring' }}
            style={styles.successIcon}
          >
            <FiCheck size={80} color="white" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={styles.successTitle}
          >
            Order Placed Successfully!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={styles.successText}
          >
            Thank you for your order. We'll deliver it to you soon!
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9 }}
            style={styles.codBadge}
          >
            <FiTruck size={24} />
            <span>Pay ₹{Math.round(getCartTotal() * 1.18)} on Delivery</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          style={styles.emptyCard}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={styles.emptyIcon}
          >
            🛒
          </motion.div>
          <h2 style={styles.emptyTitle}>Your cart is empty</h2>
          <p style={styles.emptyText}>Add some products to get started</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/products')}
            style={styles.shopButton}
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="checkout-header"
      >
        <div className="container">
          <h1>Checkout</h1>
        </div>
      </motion.div>

      <div className="container checkout-content">
        <div className="checkout-main">
          {/* Cart Items */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="cart-section"
          >
            <h2>Order Items</h2>
            <AnimatePresence>
              {cart.map((item, index) => {
                // Safety check
                if (!item || !item.product) {
                  console.error('Invalid cart item:', item);
                  return null;
                }

                return (
                  <motion.div
                    key={`${item.product._id}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className="cart-item"
                  >
                    <img 
                      src={item.product.images?.[0] || 'https://via.placeholder.com/150'} 
                      alt={item.product.name || 'Product'}
                      className="cart-item-image"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                    <div className="item-details">
                      <h3>{item.product.name || 'Unknown Product'}</h3>
                      <p className="item-meta">Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}</p>
                      <p className="item-price">₹{item.product.price || 0}</p>
                    </div>
                    <div className="quantity-control">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </motion.button>
                      <span>{item.quantity}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity + 1)}
                        disabled={item.quantity >= (item.product.stock || 0)}
                      >
                        +
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, color: '#d63031' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                      className="delete-btn"
                    >
                      <FiTrash2 size={20} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="summary-section"
          >
            <h2>Order Summary</h2>
            <div className="summary-card">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{getCartTotal()}</span>
              </div>
              <div className="summary-row">
                <span>GST (18%)</span>
                <span>₹{Math.round(getCartTotal() * 0.18)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span className="free-delivery">FREE</span>
              </div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>₹{Math.round(getCartTotal() * 1.18)}</span>
              </div>

              <div className="payment-info">
                <FiTruck size={24} color="#667eea" />
                <div>
                  <h4>Cash on Delivery</h4>
                  <p>Pay when you receive</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlaceOrder}
                disabled={loading || cart.length === 0}
                className="place-order-btn"
                style={{ 
                  opacity: loading ? 0.7 : 1, 
                  cursor: loading ? 'not-allowed' : 'pointer' 
                }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  successContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem'
  },
  successCard: {
    background: 'white',
    padding: '3rem',
    borderRadius: '20px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  successIcon: {
    width: '120px',
    height: '120px',
    background: '#00b894',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem'
  },
  successTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1rem'
  },
  successText: {
    fontSize: '1.1rem',
    color: '#636e72',
    marginBottom: '2rem',
    lineHeight: 1.6
  },
  codBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
    background: '#f0f3ff',
    borderRadius: '12px',
    color: '#667eea',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  emptyContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
    padding: '2rem'
  },
  emptyCard: {
    background: 'white',
    padding: '3rem',
    borderRadius: '20px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.5rem'
  },
  emptyText: {
    fontSize: '1.1rem',
    color: '#636e72',
    marginBottom: '2rem'
  },
  shopButton: {
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default Checkout;
