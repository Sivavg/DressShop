import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiEye, FiAlertCircle, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);


  useEffect(() => {
    if (showLoginDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLoginDialog]);


  const handleAddToCart = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (product.stock === 0) {
      return;
    }

    onAddToCart(product);
  };


  return (
    <>
      {/* Login Required Dialog */}
      <AnimatePresence>
        {showLoginDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginDialog(false)}
              style={styles.dialogOverlay}
            />

            <motion.div
              initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              animate={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
              exit={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={styles.loginDialog}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowLoginDialog(false)}
                style={styles.closeButton}
              >
                <FiX size={24} />
              </motion.button>

              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 0.6 }}
                style={styles.dialogIcon}
              >
                <FiAlertCircle size={70} color="#ff9800" />
              </motion.div>

              <h2 style={styles.dialogTitle}>Login Required</h2>
              <p style={styles.dialogMessage}>
                Please login or register to add items to your cart and proceed with checkout.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
        style={styles.card}
      >
        <div style={styles.imageContainer} onClick={() => navigate(`/product/${product._id}`)}>
          <img src={product.images[0]} alt={product.name} style={styles.image} />
          
          {product.stock === 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={styles.outOfStockBadge}
            >
              OUT OF STOCK
            </motion.div>
          )}
          
          {product.featured && product.stock > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={styles.featuredBadge}
            >
              FEATURED
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={styles.overlay}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product._id}`);
              }}
              style={styles.viewButton}
            >
              <FiEye size={20} />
              View Details
            </motion.button>
          </motion.div>
        </div>

        <div style={styles.info}>
          <h3 style={styles.name}>{product.name}</h3>
          <p style={styles.category}>{product.category}</p>
          <div style={styles.footer}>
            <span style={styles.price}>₹{product.price}</span>
            <motion.button
              whileHover={{ scale: product.stock === 0 ? 1 : 1.1 }}
              whileTap={{ scale: product.stock === 0 ? 1 : 0.9 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                ...styles.addButton,
                opacity: product.stock === 0 ? 0.5 : 1,
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                background: product.stock === 0 
                  ? '#95a5a6' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
              title={product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            >
              <FiShoppingCart size={18} />
            </motion.button>
          </div>
          
          {product.stock === 0 ? (
            <p style={styles.outOfStockText}>Out of Stock</p>
          ) : product.stock > 0 && product.stock < 10 ? (
            <p style={styles.lowStock}>Only {product.stock} left!</p>
          ) : (
            <p style={styles.inStock}>In Stock ({product.stock})</p>
          )}
        </div>
      </motion.div>
    </>
  );
};


const styles = {
  card: {
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  imageContainer: {
    position: 'relative',
    height: '300px',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  outOfStockBadge: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    background: '#d63031',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    boxShadow: '0 5px 15px rgba(214, 48, 49, 0.4)',
    zIndex: 2
  },
  featuredBadge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: '#00b894',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    boxShadow: '0 5px 15px rgba(0, 184, 148, 0.4)',
    zIndex: 2
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.3s ease'
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.8rem 1.5rem',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  info: {
    padding: '1.5rem'
  },
  name: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.5rem'
  },
  category: {
    fontSize: '0.9rem',
    color: '#636e72',
    marginBottom: '1rem'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.8rem'
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#667eea'
  },
  addButton: {
    padding: '0.8rem',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  outOfStockText: {
    color: '#d63031',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  lowStock: {
    color: '#ff6b6b',
    fontSize: '0.85rem',
    fontWeight: '600',
    textAlign: 'center'
  },
  inStock: {
    color: '#00b894',
    fontSize: '0.85rem',
    fontWeight: '600',
    textAlign: 'center'
  },
  // Login Dialog Styles
  dialogOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9998,
    backdropFilter: 'blur(8px)'
  },
  loginDialog: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    background: '#fff9e6',
    padding: '2.5rem 2rem',
    borderRadius: '25px',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
    border: '4px solid #ff9800'
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#2d3436',
    padding: '0.5rem'
  },
  dialogIcon: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center'
  },
  dialogTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: '1rem'
  },
  dialogMessage: {
    fontSize: '1.1rem',
    color: '#2d3436',
    marginBottom: '0',
    lineHeight: 1.6
  }
};


export default ProductCard;
