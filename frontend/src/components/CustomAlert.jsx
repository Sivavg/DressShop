import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';

const CustomAlert = ({ show, type = 'info', title, message, onClose, autoClose = true, duration = 3000 }) => {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  const getIcon = () => {
    const iconSize = window.innerWidth < 480 ? 40 : 50;
    switch (type) {
      case 'success':
        return <FiCheckCircle size={iconSize} color="#00b894" />;
      case 'error':
        return <FiAlertCircle size={iconSize} color="#d63031" />;
      case 'warning':
        return <FiAlertTriangle size={iconSize} color="#fdcb6e" />;
      case 'info':
      default:
        return <FiInfo size={iconSize} color="#667eea" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#e8f5e9', border: '#00b894', progress: '#00b894' };
      case 'error':
        return { bg: '#fff5f5', border: '#d63031', progress: '#d63031' };
      case 'warning':
        return { bg: '#fff9e6', border: '#fdcb6e', progress: '#fdcb6e' };
      case 'info':
      default:
        return { bg: '#f0f3ff', border: '#667eea', progress: '#667eea' };
    }
  };

  const colors = getColors();

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

          {/* Alert Card */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              ...styles.alertCard,
              background: colors.bg,
              borderColor: colors.border
            }}
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
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
              style={styles.iconContainer}
            >
              {getIcon()}
            </motion.div>

            {title && <h2 style={styles.title}>{title}</h2>}
            <p style={styles.message}>{message}</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                ...styles.okButton,
                background: colors.border
              }}
            >
              OK
            </motion.button>

            {/* Progress Bar */}
            {autoClose && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                style={{
                  ...styles.progressBar,
                  background: colors.progress
                }}
              />
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
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9998,
    backdropFilter: 'blur(5px)'
  },
  alertCard: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    maxWidth: '450px',
    width: '90%',
    textAlign: 'center',
    border: '3px solid',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  closeButton: {
    position: 'absolute',
    top: '0.8rem',
    right: '0.8rem',
    background: 'transparent',
    border: 'none',
    color: '#636e72',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    marginBottom: '1.5rem'
  },
  title: {
    fontSize: '1.6rem',
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
  okButton: {
    width: '100%',
    padding: '1rem 2rem',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '0.5rem'
  },
  progressBar: {
    height: '4px',
    borderRadius: '2px',
    marginTop: '1rem'
  }
};

// Responsive for tablets (768px - 480px)
const mediaQueryTablet = window.matchMedia('(max-width: 768px) and (min-width: 481px)');
if (mediaQueryTablet.matches) {
  styles.alertCard = {
    ...styles.alertCard,
    padding: '2rem 1.5rem',
    maxWidth: '400px',
    width: '85%',
    borderRadius: '15px'
  };
  
  styles.title = {
    ...styles.title,
    fontSize: '1.4rem'
  };
  
  styles.message = {
    ...styles.message,
    fontSize: '1rem',
    marginBottom: '1.5rem'
  };
  
  styles.okButton = {
    ...styles.okButton,
    padding: '0.9rem 1.8rem',
    fontSize: '1rem'
  };
  
  styles.closeButton = {
    ...styles.closeButton,
    top: '0.7rem',
    right: '0.7rem'
  };
}

// Responsive for mobile (< 480px)
const mediaQueryMobile = window.matchMedia('(max-width: 480px)');
if (mediaQueryMobile.matches) {
  styles.alertCard = {
    ...styles.alertCard,
    padding: '1.5rem 1rem',
    maxWidth: '340px',
    width: '92%',
    borderRadius: '15px',
    border: '2px solid'
  };
  
  styles.closeButton = {
    ...styles.closeButton,
    top: '0.5rem',
    right: '0.5rem',
    padding: '0.3rem'
  };
  
  styles.iconContainer = {
    ...styles.iconContainer,
    marginBottom: '1rem'
  };
  
  styles.title = {
    ...styles.title,
    fontSize: '1.2rem',
    marginBottom: '0.8rem'
  };
  
  styles.message = {
    ...styles.message,
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
    lineHeight: 1.5
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

// Extra small devices (< 360px)
const mediaQueryExtraSmall = window.matchMedia('(max-width: 360px)');
if (mediaQueryExtraSmall.matches) {
  styles.alertCard = {
    ...styles.alertCard,
    padding: '1.2rem 0.8rem',
    maxWidth: '300px',
    width: '95%',
    borderRadius: '12px'
  };
  
  styles.title = {
    ...styles.title,
    fontSize: '1.1rem'
  };
  
  styles.message = {
    ...styles.message,
    fontSize: '0.9rem',
    marginBottom: '1.2rem'
  };
  
  styles.okButton = {
    ...styles.okButton,
    padding: '0.7rem 1.2rem',
    fontSize: '0.9rem'
  };
}

export default CustomAlert;
