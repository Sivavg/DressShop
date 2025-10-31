import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiX } from 'react-icons/fi';

const StockAlert = ({ show, message, availableStock, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const iconSize = window.innerWidth < 480 ? 50 : 60;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.overlay}
          />

          {/* Alert Modal */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 25 }}
            style={styles.modal}
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={styles.closeButton}
            >
              <FiX size={20} />
            </motion.button>

            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              style={styles.iconContainer}
            >
              <FiAlertCircle size={iconSize} color="#d63031" />
            </motion.div>

            <h2 style={styles.title}>Stock Limit Exceeded!</h2>
            
            <p style={styles.message}>{message}</p>

            <div style={styles.stockInfo}>
              <span style={styles.stockLabel}>Available Stock:</span>
              <span style={styles.stockValue}>{availableStock} {availableStock === 1 ? 'item' : 'items'}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={styles.okButton}
            >
              Got it!
            </motion.button>

            {/* Auto close progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              style={styles.progressBar}
            />
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
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9998,
    backdropFilter: 'blur(5px)'
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '3rem 2.5rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'transparent',
    border: 'none',
    color: '#636e72',
    cursor: 'pointer',
    padding: '0.5rem'
  },
  iconContainer: {
    marginBottom: '1.5rem'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1rem'
  },
  message: {
    fontSize: '1.1rem',
    color: '#636e72',
    marginBottom: '2rem',
    lineHeight: 1.6
  },
  stockInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1.5rem',
    background: '#fff5f5',
    borderRadius: '15px',
    border: '2px solid #ffe0e0',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  },
  stockLabel: {
    fontSize: '1rem',
    color: '#636e72',
    fontWeight: '600'
  },
  stockValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#d63031'
  },
  okButton: {
    width: '100%',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  progressBar: {
    height: '4px',
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    borderRadius: '2px',
    marginTop: '1rem'
  }
};

// Responsive for tablets
const mediaQueryTablet = window.matchMedia('(max-width: 768px) and (min-width: 481px)');
if (mediaQueryTablet.matches) {
  styles.modal = {
    ...styles.modal,
    padding: '2.5rem 2rem',
    maxWidth: '450px',
    width: '85%'
  };
  
  styles.title = {
    ...styles.title,
    fontSize: '1.6rem'
  };
  
  styles.message = {
    ...styles.message,
    fontSize: '1rem'
  };
  
  styles.stockInfo = {
    ...styles.stockInfo,
    padding: '1.2rem',
    gap: '0.8rem'
  };
  
  styles.stockValue = {
    ...styles.stockValue,
    fontSize: '1.3rem'
  };
}

// Responsive for mobile
const mediaQueryMobile = window.matchMedia('(max-width: 480px)');
if (mediaQueryMobile.matches) {
  styles.modal = {
    ...styles.modal,
    padding: '1.5rem 1rem',
    maxWidth: '340px',
    width: '92%',
    borderRadius: '15px'
  };
  
  styles.closeButton = {
    ...styles.closeButton,
    top: '0.7rem',
    right: '0.7rem',
    padding: '0.3rem'
  };
  
  styles.iconContainer = {
    ...styles.iconContainer,
    marginBottom: '1rem'
  };
  
  styles.title = {
    ...styles.title,
    fontSize: '1.3rem',
    marginBottom: '0.8rem'
  };
  
  styles.message = {
    ...styles.message,
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
    lineHeight: 1.5
  };
  
  styles.stockInfo = {
    ...styles.stockInfo,
    padding: '1rem',
    gap: '0.5rem',
    flexDirection: 'column',
    marginBottom: '1.5rem'
  };
  
  styles.stockLabel = {
    ...styles.stockLabel,
    fontSize: '0.9rem'
  };
  
  styles.stockValue = {
    ...styles.stockValue,
    fontSize: '1.2rem'
  };
  
  styles.okButton = {
    ...styles.okButton,
    padding: '0.8rem 1.5rem',
    fontSize: '0.95rem',
    borderRadius: '40px'
  };
  
  styles.progressBar = {
    ...styles.progressBar,
    height: '3px',
    marginTop: '0.8rem'
  };
}

// Extra small devices
const mediaQueryExtraSmall = window.matchMedia('(max-width: 360px)');
if (mediaQueryExtraSmall.matches) {
  styles.modal = {
    ...styles.modal,
    padding: '1.2rem 0.8rem',
    maxWidth: '300px',
    width: '95%'
  };
  
  styles.title = {
    ...styles.title,
    fontSize: '1.1rem'
  };
  
  styles.message = {
    ...styles.message,
    fontSize: '0.85rem',
    marginBottom: '1.2rem'
  };
  
  styles.okButton = {
    ...styles.okButton,
    padding: '0.7rem 1.2rem',
    fontSize: '0.85rem'
  };
}

export default StockAlert;
