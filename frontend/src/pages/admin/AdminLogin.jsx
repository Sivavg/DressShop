import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';


const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({
    show: false,
    type: 'success', // 'success' or 'error'
    title: '',
    message: ''
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


  const showDialog = (type, title, message) => {
    setDialog({
      show: true,
      type,
      title,
      message
    });
  };


  const closeDialog = () => {
    setDialog({ ...dialog, show: false });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);


    try {
      const response = await api.post('/admin/login', formData);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));
      
      // Show success dialog
      showDialog('success', 'Login Successful', 'Welcome to Admin Dashboard');
      
      // Redirect to admin dashboard after 5 seconds
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 5000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      showDialog('error', 'Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const getDialogIcon = () => {
    const iconSize = 60;
    if (dialog.type === 'success') {
      return <FiCheckCircle size={iconSize} color="#00b894" />;
    } else {
      return <FiXCircle size={iconSize} color="#d63031" />;
    }
  };


  const getDialogColors = () => {
    if (dialog.type === 'success') {
      return { bg: '#e8f5e9', border: '#00b894', btnBg: '#00b894' };
    } else {
      return { bg: '#fff5f5', border: '#d63031', btnBg: '#d63031' };
    }
  };


  return (
    <>
      <div style={styles.container}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={styles.card}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.3, type: 'spring' }}
            style={styles.logo}
          >
            <FiShield size={50} color="white" />
          </motion.div>


          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={styles.title}
          >
            Admin Login
          </motion.h2>


          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={styles.subtitle}
          >
            Access the admin dashboard
          </motion.p>


          <form onSubmit={handleSubmit} style={styles.form}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={styles.inputGroup}
            >
              <div style={styles.inputWrapper}>
                <FiMail style={styles.icon} />
                <input
                  type="email"
                  placeholder="Admin Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
            </motion.div>


            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={styles.inputGroup}
            >
              <div style={styles.inputWrapper}>
                <FiLock style={styles.icon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={styles.input}
                  required
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </motion.button>
              </div>
            </motion.div>


            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(214, 48, 49, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </motion.button>
          </form>


          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={styles.footer}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/')}
              style={styles.backButton}
            >
              ← Back to Store
            </motion.button>
          </motion.div>
        </motion.div>
      </div>


      {/* Success/Error Dialog */}
      <AnimatePresence>
        {dialog.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dialog.type === 'error' ? closeDialog : null}
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
                animate={{ 
                  scale: dialog.type === 'success' ? [1, 1.2, 1] : [1, 0.8, 1],
                  rotate: dialog.type === 'success' ? [0, 10, -10, 0] : [0, -10, 10, 0]
                }}
                transition={{ duration: 0.6 }}
                style={styles.dialogIcon}
              >
                {getDialogIcon()}
              </motion.div>


              <h2 style={styles.dialogTitle}>{dialog.title}</h2>
              <p style={styles.dialogMessage}>{dialog.message}</p>


              {dialog.type === 'success' && (
                <>
                  <p style={styles.redirectMessage}>Redirecting to admin dashboard...</p>
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeDialog}
                  style={{
                    ...styles.dialogButton,
                    background: getDialogColors().btnBg
                  }}
                >
                  Try Again
                </motion.button>
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
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)'
  },
  card: {
    background: 'white',
    padding: '3rem 2.5rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '450px',
    width: '100%'
  },
  logo: {
    width: '100px',
    height: '100px',
    margin: '0 auto 2rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(214, 48, 49, 0.3)'
  },
  title: {
    textAlign: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.5rem'
  },
  subtitle: {
    textAlign: 'center',
    color: '#636e72',
    marginBottom: '2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  inputGroup: {
    position: 'relative'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    position: 'absolute',
    left: '1rem',
    color: '#d63031',
    fontSize: '1.2rem'
  },
  input: {
    width: '100%',
    padding: '1rem 1rem 1rem 3rem',
    border: '2px solid #dfe6e9',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  eyeButton: {
    position: 'absolute',
    right: '1rem',
    background: 'transparent',
    border: 'none',
    color: '#636e72',
    cursor: 'pointer',
    padding: '0.5rem'
  },
  button: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem'
  },
  footer: {
    textAlign: 'center',
    marginTop: '2rem'
  },
  backButton: {
    color: '#d63031',
    background: 'transparent',
    border: 'none',
    fontSize: '0.95rem',
    cursor: 'pointer',
    padding: '0.5rem',
    fontWeight: '600'
  },
  // Dialog Styles
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
  dialogBox: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    background: 'white',
    padding: '3rem 2.5rem',
    borderRadius: '25px',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
    border: '4px solid'
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
    fontSize: '1.2rem',
    color: '#636e72',
    marginBottom: '1.5rem',
    lineHeight: 1.6
  },
  redirectMessage: {
    fontSize: '1rem',
    color: '#00b894',
    marginBottom: '1rem',
    fontWeight: '600'
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
    marginBottom: '1rem'
  },
  progressBar: {
    height: '5px',
    borderRadius: '3px',
    marginTop: '1.5rem'
  }
};


// Mobile responsive for dialog
const mediaQueryMobile = window.matchMedia('(max-width: 480px)');
if (mediaQueryMobile.matches) {
  styles.dialogBox.padding = '2rem 1.5rem';
  styles.dialogBox.maxWidth = '360px';
  styles.dialogTitle.fontSize = '1.5rem';
  styles.dialogMessage.fontSize = '1rem';
}


export default AdminLogin;
