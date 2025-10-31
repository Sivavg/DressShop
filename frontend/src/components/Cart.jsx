import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            style={styles.cart}
          >
            <div style={styles.header}>
              <h2>Shopping Cart</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={styles.closeButton}
              >
                <FiX size={24} />
              </motion.button>
            </div>

            <div style={styles.items}>
              {cart.length === 0 ? (
                <div style={styles.empty}>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <motion.div
                    key={`${item.product._id}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={styles.item}
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      style={styles.itemImage}
                    />
                    <div style={styles.itemDetails}>
                      <h4>{item.product.name}</h4>
                      <p style={styles.itemMeta}>
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <p style={styles.price}>₹{item.product.price}</p>
                      
                      <div style={styles.quantityControls}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity - 1)}
                          style={styles.quantityButton}
                        >
                          <FiMinus />
                        </motion.button>
                        <span style={styles.quantity}>{item.quantity}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity + 1)}
                          style={styles.quantityButton}
                        >
                          <FiPlus />
                        </motion.button>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.2, color: '#d63031' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                      style={styles.deleteButton}
                    >
                      <FiTrash2 size={18} />
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={styles.footer}>
                <div style={styles.total}>
                  <span>Total:</span>
                  <span style={styles.totalPrice}>₹{getCartTotal()}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckout}
                  style={styles.checkoutButton}
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999
  },
  cart: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: '450px',
    background: 'white',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-5px 0 20px rgba(0,0,0,0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #dfe6e9'
  },
  closeButton: {
    background: 'transparent',
    padding: '0.5rem',
    color: '#2d3436'
  },
  items: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem'
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#636e72'
  },
  item: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    marginBottom: '1rem',
    background: '#f8f9fa',
    borderRadius: '10px',
    position: 'relative'
  },
  itemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  itemDetails: {
    flex: 1
  },
  itemMeta: {
    fontSize: '0.85rem',
    color: '#636e72',
    margin: '0.3rem 0'
  },
  price: {
    fontWeight: 'bold',
    color: '#667eea',
    fontSize: '1.1rem',
    margin: '0.5rem 0'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    marginTop: '0.5rem'
  },
  quantityButton: {
    background: '#667eea',
    color: 'white',
    padding: '0.4rem',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantity: {
    fontWeight: 'bold',
    fontSize: '1rem'
  },
  deleteButton: {
    background: 'transparent',
    color: '#636e72',
    padding: '0.5rem'
  },
  footer: {
    padding: '1.5rem',
    borderTop: '1px solid #dfe6e9'
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  totalPrice: {
    color: '#667eea',
    fontSize: '1.5rem'
  },
  checkoutButton: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '1rem'
  }
};

export default Cart;
