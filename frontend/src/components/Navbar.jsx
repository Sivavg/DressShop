import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiShield, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, cart, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (dialog.show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [dialog.show]);

  const showDialog = (type, title, message, onConfirm) => {
    setDialog({
      show: true,
      type,
      title,
      message,
      onConfirm: onConfirm || (() => setDialog({ ...dialog, show: false }))
    });
  };

  const closeDialog = () => {
    setDialog({ ...dialog, show: false });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    showDialog('success', 'Logged Out', 'You have been successfully logged out');
  };

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      showDialog(
        'warning',
        'Login Required',
        'Please login or register to view your cart and place orders',
        () => {
          closeDialog();
          navigate('/login');
        }
      );
    }
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const getDialogIcon = () => {
    const iconSize = 50;
    switch (dialog.type) {
      case 'success':
        return <FiCheckCircle size={iconSize} color="#00b894" />;
      case 'error':
        return <FiAlertCircle size={iconSize} color="#d63031" />;
      case 'warning':
        return <FiAlertCircle size={iconSize} color="#fdcb6e" />;
      default:
        return <FiInfo size={iconSize} color="#667eea" />;
    }
  };

  const getDialogColors = () => {
    switch (dialog.type) {
      case 'success':
        return { bg: '#e8f5e9', border: '#00b894', btnBg: '#00b894' };
      case 'error':
        return { bg: '#fff5f5', border: '#d63031', btnBg: '#d63031' };
      case 'warning':
        return { bg: '#fff9e6', border: '#fdcb6e', btnBg: '#fdcb6e' };
      default:
        return { bg: '#f0f3ff', border: '#667eea', btnBg: '#667eea' };
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={styles.nav}
      >
        <div className="container" style={styles.container}>
          <Link to="/" style={styles.logo}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              DressShop
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div style={styles.desktopMenu}>
            <Link to="/" style={styles.link}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                Home
              </motion.div>
            </Link>
            <Link to="/products" style={styles.link}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                Products
              </motion.div>
            </Link>
            {user && (
              <Link to="/orders" style={styles.link}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  My Orders
                </motion.div>
              </Link>
            )}
            {/* Show Admin link only for guests (not logged in users) */}
            {!user && (
              <Link to="/admin/login" style={styles.link}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={styles.adminLink}>
                  <FiShield size={16} />
                  Admin
                </motion.div>
              </Link>
            )}
          </div>

          <div style={styles.actions}>
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.1 }} style={styles.iconButton}>
                  <span style={styles.userName}>{user.name}</span>
                </motion.div>
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }} 
                  onClick={handleLogout} 
                  style={styles.iconButton}
                >
                  <FiLogOut size={20} />
                </motion.button>
              </>
            ) : (
              <Link to="/login">
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }} 
                  style={styles.iconButton}
                >
                  <FiUser size={20} />
                </motion.button>
              </Link>
            )}

            <Link to="/checkout" onClick={handleCartClick} style={styles.cartButton}>
              <motion.div 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                style={styles.cartIcon}
              >
                <FiShoppingCart size={20} />
                {cartItemsCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    style={styles.badge}
                  >
                    {cartItemsCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setMenuOpen(!menuOpen)} 
              style={styles.menuButton}
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Dialog */}
      <AnimatePresence>
        {dialog.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDialog}
              style={styles.dialogOverlay}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  ...styles.dialogBox,
                  background: getDialogColors().bg,
                  borderColor: getDialogColors().border
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeDialog}
                  style={styles.dialogCloseButton}
                >
                  <FiX size={20} />
                </motion.button>

                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                  style={styles.dialogIcon}
                >
                  {getDialogIcon()}
                </motion.div>

                <h2 style={styles.dialogTitle}>{dialog.title}</h2>
                <p style={styles.dialogMessage}>{dialog.message}</p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    dialog.onConfirm && dialog.onConfirm();
                  }}
                  style={{
                    ...styles.dialogButton,
                    background: getDialogColors().btnBg
                  }}
                >
                  {dialog.type === 'warning' ? 'Login Now' : 'OK'}
                </motion.button>

                {dialog.type !== 'warning' && (
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    style={{
                      ...styles.progressBar,
                      background: getDialogColors().btnBg
                    }}
                    onAnimationComplete={closeDialog}
                  />
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setMenuOpen(false)} 
            style={styles.overlay} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'tween', duration: 0.3 }} 
            style={styles.sidebar}
          >
            <div style={styles.sidebarHeader}>
              <h2 style={styles.sidebarTitle}>Menu</h2>
              <button onClick={() => setMenuOpen(false)} style={styles.closeButton}>
                <FiX size={24} />
              </button>
            </div>
            <div style={styles.sidebarContent}>
              {user && (
                <div style={styles.userInfo}>
                  <FiUser size={24} />
                  <span style={styles.userNameSidebar}>{user.name}</span>
                </div>
              )}
              <Link to="/" onClick={() => setMenuOpen(false)} style={styles.sidebarLink}>
                <span>Home</span>
              </Link>
              <Link to="/products" onClick={() => setMenuOpen(false)} style={styles.sidebarLink}>
                <span>Products</span>
              </Link>
              {user && (
                <Link to="/orders" onClick={() => setMenuOpen(false)} style={styles.sidebarLink}>
                  <span>My Orders</span>
                </Link>
              )}
              {/* Show Admin link only for guests in sidebar too */}
              {!user && (
                <Link to="/admin/login" onClick={() => setMenuOpen(false)} style={styles.sidebarLink}>
                  <FiShield size={18} style={{ marginRight: '0.5rem' }} />
                  <span>Admin Panel</span>
                </Link>
              )}
              {!user ? (
                <Link to="/login" onClick={() => setMenuOpen(false)} style={styles.sidebarLink}>
                  <span>Login / Register</span>
                </Link>
              ) : (
                <button onClick={handleLogout} style={styles.logoutButton}>
                  <FiLogOut size={18} style={{ marginRight: '0.5rem' }} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Styles remain the same...
const styles = {
  nav: { 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    color: 'white', 
    padding: '1rem 0', 
    position: 'sticky', 
    top: 0, 
    zIndex: 1000, 
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
  },
  container: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  logo: { 
    fontSize: '1.8rem', 
    fontWeight: 'bold', 
    color: 'white', 
    textDecoration: 'none' 
  },
  desktopMenu: { 
    display: 'flex', 
    gap: '2rem' 
  },
  link: { 
    color: 'white', 
    fontWeight: '500', 
    display: 'none',
    textDecoration: 'none'
  },
  adminLink: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem', 
    background: 'rgba(255,255,255,0.2)', 
    padding: '0.5rem 1rem', 
    borderRadius: '20px' 
  },
  actions: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1rem' 
  },
  iconButton: { 
    background: 'transparent', 
    color: 'white', 
    padding: '0.5rem', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem', 
    border: 'none', 
    cursor: 'pointer' 
  },
  userName: { 
    fontSize: '0.9rem' 
  },
  cartButton: { 
    color: 'white', 
    position: 'relative' 
  },
  cartIcon: { 
    position: 'relative', 
    padding: '0.5rem' 
  },
  badge: { 
    position: 'absolute', 
    top: '-5px', 
    right: '-5px', 
    background: '#ff6b9d', 
    color: 'white', 
    borderRadius: '50%', 
    width: '20px', 
    height: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '0.7rem', 
    fontWeight: 'bold' 
  },
  menuButton: { 
    background: 'transparent', 
    color: 'white', 
    padding: '0.5rem', 
    display: 'block', 
    border: 'none', 
    cursor: 'pointer' 
  },
  dialogOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10000,
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  dialogBox: {
    position: 'relative',
    background: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '25px',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
    zIndex: 10001,
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
    border: '4px solid',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  dialogCloseButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#2d3436',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dialogIcon: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center'
  },
  dialogTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1rem'
  },
  dialogMessage: {
    fontSize: '1.1rem',
    color: '#636e72',
    marginBottom: '2rem',
    lineHeight: 1.6
  },
  dialogButton: {
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
  },
  overlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(0,0,0,0.5)', 
    zIndex: 1500, 
    backdropFilter: 'blur(2px)' 
  },
  sidebar: { 
    position: 'fixed', 
    top: 0, 
    right: 0, 
    bottom: 0, 
    width: '300px', 
    maxWidth: '80vw', 
    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)', 
    zIndex: 2000, 
    boxShadow: '-4px 0 20px rgba(0,0,0,0.3)', 
    display: 'flex', 
    flexDirection: 'column' 
  },
  sidebarHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '1.5rem', 
    borderBottom: '1px solid rgba(255,255,255,0.2)' 
  },
  sidebarTitle: { 
    color: 'white', 
    fontSize: '1.5rem', 
    fontWeight: 'bold', 
    margin: 0 
  },
  closeButton: { 
    background: 'transparent', 
    border: 'none', 
    color: 'white', 
    cursor: 'pointer', 
    padding: '0.5rem', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  sidebarContent: { 
    flex: 1, 
    padding: '1rem', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.5rem', 
    overflowY: 'auto' 
  },
  userInfo: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1rem', 
    padding: '1rem', 
    background: 'rgba(255,255,255,0.15)', 
    borderRadius: '10px', 
    color: 'white', 
    marginBottom: '1rem' 
  },
  userNameSidebar: { 
    fontSize: '1rem', 
    fontWeight: '600' 
  },
  sidebarLink: { 
    display: 'flex', 
    alignItems: 'center', 
    color: 'white', 
    padding: '1rem', 
    textDecoration: 'none', 
    borderRadius: '8px', 
    transition: 'background 0.3s ease', 
    fontSize: '1rem', 
    fontWeight: '500', 
    background: 'rgba(255,255,255,0.05)' 
  },
  logoutButton: { 
    display: 'flex', 
    alignItems: 'center', 
    color: 'white', 
    padding: '1rem', 
    border: 'none', 
    borderRadius: '8px', 
    background: 'rgba(255,100,100,0.3)', 
    cursor: 'pointer', 
    fontSize: '1rem', 
    fontWeight: '500', 
    marginTop: 'auto', 
    width: '100%', 
    textAlign: 'left' 
  }
};

const mediaQuery = window.matchMedia('(min-width: 769px)');
if (mediaQuery.matches) {
  styles.link.display = 'block';
  styles.menuButton.display = 'none';
}

const mediaQueryMobile = window.matchMedia('(max-width: 480px)');
if (mediaQueryMobile.matches) {
  styles.dialogBox.padding = '2rem 1.5rem';
  styles.dialogBox.maxWidth = '380px';
  styles.dialogBox.width = '95%';
  styles.dialogTitle.fontSize = '1.5rem';
  styles.dialogMessage.fontSize = '1rem';
}

export default Navbar;
