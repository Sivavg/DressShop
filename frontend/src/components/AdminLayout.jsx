import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiPackage, FiLogOut, FiShield, FiMenu, FiX, FiShoppingBag, FiCheckCircle, FiXCircle } from 'react-icons/fi';


const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialog, setDialog] = useState({
    show: false,
    type: 'warning', // 'warning', 'success', or 'error'
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    showButtons: false
  });


  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);


  // Prevent body scroll when sidebar is open on mobile or dialog is shown
  useEffect(() => {
    if (sidebarOpen || dialog.show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, dialog.show]);


  const showDialog = (type, title, message, onConfirm, onCancel, showButtons = false) => {
    setDialog({
      show: true,
      type,
      title,
      message,
      onConfirm: onConfirm || (() => setDialog({ ...dialog, show: false })),
      onCancel: onCancel || (() => setDialog({ ...dialog, show: false })),
      showButtons
    });
  };


  const closeDialog = () => {
    setDialog({ ...dialog, show: false });
  };


  const handleLogoutClick = () => {
    setSidebarOpen(false);
    // Show confirmation dialog
    showDialog(
      'warning',
      'Confirm Logout',
      'Are you sure you want to logout from admin panel?',
      handleLogoutConfirm,
      handleLogoutCancel,
      true // Show OK and Cancel buttons
    );
  };


  const handleLogoutConfirm = () => {
    // Close confirmation dialog
    closeDialog();
    
    // Perform logout
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    
    // Show success dialog after a brief delay
    setTimeout(() => {
      showDialog('success', 'Logout Successful', 'You have been logged out successfully');
      
      // Redirect after 5 seconds
      setTimeout(() => {
        navigate('/admin/login');
      }, 5000);
    }, 300);
  };


  const handleLogoutCancel = () => {
    // Close confirmation dialog
    closeDialog();
    
    // Show cancelled dialog after a brief delay
    setTimeout(() => {
      showDialog('error', 'Logout Cancelled', 'You have cancelled the logout');
    }, 300);
  };


  const menuItems = [
    { path: '/admin/dashboard', icon: <FiHome size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <FiShoppingBag size={20} />, label: 'Products' },
    { path: '/admin/users', icon: <FiUsers size={20} />, label: 'Users' },
    { path: '/admin/orders', icon: <FiPackage size={20} />, label: 'Orders' }
  ];


  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };


  const getDialogIcon = () => {
    const iconSize = 50;
    switch (dialog.type) {
      case 'success':
        return <FiCheckCircle size={iconSize} color="#00b894" />;
      case 'error':
        return <FiXCircle size={iconSize} color="#d63031" />;
      case 'warning':
        return <FiXCircle size={iconSize} color="#fdcb6e" />;
      default:
        return null;
    }
  };


  const getDialogColors = () => {
    switch (dialog.type) {
      case 'success':
        return { bg: '#e8f5e9', border: '#00b894', btnBg: '#00b894' };
      case 'error':
        return { bg: '#fff5f5', border: '#d63031', btnBg: '#d63031' };
      case 'warning':
        return { bg: '#fff9e6', border: '#fdcb6e', btnBg: '#d63031' };
      default:
        return { bg: '#f0f3ff', border: '#667eea', btnBg: '#667eea' };
    }
  };


  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .admin-desktop-sidebar {
            display: none !important;
          }
          .admin-mobile-header {
            display: block !important;
          }
          .admin-main-content {
            margin-left: 0 !important;
            margin-top: 70px !important;
            padding: 1rem !important;
          }
        }

        @media (min-width: 769px) {
          .admin-mobile-header {
            display: none !important;
          }
          .admin-desktop-sidebar {
            display: flex !important;
          }
          .admin-main-content {
            margin-left: 250px !important;
            margin-top: 0 !important;
          }
        }

        /* Prevent content shift when sidebar opens */
        body.sidebar-open {
          overflow: hidden;
        }
      `}</style>

      <div style={styles.container}>
        {/* Mobile Header */}
        <div className="admin-mobile-header" style={styles.mobileHeader}>
          <div style={styles.mobileHeaderContent}>
            <div style={styles.mobileLogo}>
              <FiShield size={24} color="white" />
              <span>Admin Panel</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={styles.menuButton}
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>


        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                style={styles.overlay}
              />


              {/* Sidebar */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                style={styles.mobileSidebar}
              >
                <div style={styles.sidebarHeader}>
                  <div style={styles.logo}>
                    <FiShield size={30} color="white" />
                  </div>
                  <h2 style={styles.brandName}>Admin Panel</h2>
                </div>


                <nav style={styles.nav}>
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.path}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 10, backgroundColor: '#e17055' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigate(item.path)}
                      style={{
                        ...styles.navItem,
                        background: location.pathname === item.path ? '#e17055' : 'transparent'
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </nav>


                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogoutClick}
                  style={styles.logoutButton}
                >
                  <FiLogOut size={20} />
                  <span>Logout</span>
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>


        {/* Desktop Sidebar - Always visible on desktop */}
        <div className="admin-desktop-sidebar" style={styles.desktopSidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.logo}>
              <FiShield size={30} color="white" />
            </div>
            <h2 style={styles.brandName}>Admin Panel</h2>
          </div>


          <nav style={styles.nav}>
            {menuItems.map((item) => (
              <motion.button
                key={item.path}
                whileHover={{ x: 10, backgroundColor: '#e17055' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navItem,
                  background: location.pathname === item.path ? '#e17055' : 'transparent'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>


          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogoutClick}
            style={styles.logoutButton}
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </motion.button>
        </div>


        {/* Main Content */}
        <div className="admin-main-content" style={styles.main}>
          {children}
        </div>
      </div>


      {/* Logout Confirmation/Success/Error Dialog */}
      <AnimatePresence>
        {dialog.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.dialogOverlay}
            />

            <motion.div
              initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              animate={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
              exit={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              style={{
                ...styles.dialogBox,
                background: getDialogColors().bg,
                borderColor: getDialogColors().border
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                style={styles.dialogIcon}
              >
                {getDialogIcon()}
              </motion.div>

              <h2 style={styles.dialogTitle}>{dialog.title}</h2>
              <p style={styles.dialogMessage}>{dialog.message}</p>

              {dialog.showButtons ? (
                // Show Cancel and Confirm buttons for confirmation
                <div style={styles.buttonGroup}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={dialog.onCancel}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={dialog.onConfirm}
                    style={{
                      ...styles.confirmButton,
                      background: getDialogColors().btnBg
                    }}
                  >
                    Confirm
                  </motion.button>
                </div>
              ) : (
                // Show only progress bar for success/error dialogs (no button)
                <>
                  {dialog.type === 'success' && (
                    <>
                      <p style={styles.redirectMessage}>Redirecting to login page...</p>
                      <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                        style={{
                          ...styles.progressBar,
                          background: getDialogColors().btnBg
                        }}
                      />
                    </>
                  )}

                  {dialog.type === 'error' && (
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
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};


const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8f9fa',
    position: 'relative',
    width: '100%'
  },
  mobileHeader: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    padding: '1rem',
    zIndex: 1001,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  mobileHeaderContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '100%'
  },
  mobileLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  menuButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1999,
    backdropFilter: 'blur(2px)'
  },
  mobileSidebar: {
    width: '280px',
    maxWidth: '80vw',
    background: 'linear-gradient(180deg, #d63031 0%, #e17055 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0,
    zIndex: 2000,
    overflowY: 'auto',
    boxShadow: '4px 0 20px rgba(0,0,0,0.3)'
  },
  desktopSidebar: {
    width: '250px',
    background: 'linear-gradient(180deg, #d63031 0%, #e17055 100%)',
    padding: '2rem 1rem',
    display: 'none',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0,
    zIndex: 100,
    overflowY: 'auto',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
  },
  sidebarHeader: {
    textAlign: 'center',
    marginBottom: '2.5rem'
  },
  logo: {
    width: '60px',
    height: '60px',
    margin: '0 auto 1rem',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandName: {
    color: 'white',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: 0
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    width: '100%'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: 'auto',
    width: '100%'
  },
  main: {
    flex: 1,
    marginLeft: '250px',
    padding: '2rem',
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden'
  },
  // Dialog Styles
  dialogOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9998,
    backdropFilter: 'blur(5px)'
  },
  dialogBox: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    background: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    maxWidth: '450px',
    width: '90%',
    textAlign: 'center',
    border: '3px solid'
  },
  dialogIcon: {
    marginBottom: '1.5rem'
  },
  dialogTitle: {
    fontSize: '1.6rem',
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
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.5rem'
  },
  cancelButton: {
    flex: 1,
    padding: '1rem 2rem',
    color: '#636e72',
    background: 'white',
    border: '2px solid #dfe6e9',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  confirmButton: {
    flex: 1,
    padding: '1rem 2rem',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  redirectMessage: {
    fontSize: '1rem',
    color: '#00b894',
    marginBottom: '1rem',
    fontWeight: '600'
  },
  progressBar: {
    height: '4px',
    borderRadius: '2px',
    marginTop: '1rem'
  }
};


export default AdminLayout;
