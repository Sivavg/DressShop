import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';


const Login = () => {
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
  const { login } = useAuth();
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
      console.log('🔐 Logging in...');
      
      const response = await api.post('/auth/login', formData);
      
      console.log('=== LOGIN RESPONSE ===');
      console.log('Token:', response.data.token?.substring(0, 30) + '...');
      console.log('Token type:', typeof response.data.token);
      console.log('Token length:', response.data.token?.length);
      
      // CORRECT ORDER: (user, token)
      login(response.data.user, response.data.token);
      
      // Verify
      const stored = localStorage.getItem('token');
      console.log('✅ Token stored:', stored?.substring(0, 30) + '...');
      
      // Show success dialog
      showDialog('success', 'Login Successful', 'You have been successfully logged in');
      
      // Redirect after 5 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);
      
    } catch (error) {
      console.error('❌ Login error:', error);
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.wrapper}
        >
          <motion.div
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={styles.card}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              style={styles.logo}
            >
              <div style={styles.logoCircle}>DS</div>
            </motion.div>


            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={styles.title}
            >
              Welcome Back
            </motion.h2>


            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={styles.subtitle}
            >
              Login to continue shopping
            </motion.p>


            <form onSubmit={handleSubmit} style={styles.form}>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={styles.inputGroup}
              >
                <div style={styles.inputWrapper}>
                  <FiMail style={styles.icon} />
                  <input
                    type="email"
                    placeholder="Email Address"
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
                transition={{ delay: 0.9 }}
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
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </motion.button>
            </form>


            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              style={styles.footer}
            >
              <p>
                Don't have an account?{' '}
                <Link to="/register" style={styles.link}>
                  <motion.span whileHover={{ scale: 1.05 }} style={{ display: 'inline-block' }}>
                    Register Now
                  </motion.span>
                </Link>
              </p>
              <Link to="/" style={styles.link}>
                <motion.span whileHover={{ scale: 1.05 }} style={{ display: 'inline-block' }}>
                  Continue as Guest
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={styles.sideImage}
          >
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
              alt="Fashion"
              style={styles.image}
            />
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
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  style={{
                    ...styles.progressBar,
                    background: getDialogColors().btnBg
                  }}
                />
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  wrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    maxWidth: '1000px',
    width: '100%',
    gap: '2rem'
  },
  card: {
    background: 'white',
    padding: '3rem 2rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    position: 'relative',
    overflow: 'hidden'
  },
  logo: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  logoCircle: {
    width: '80px',
    height: '80px',
    margin: '0 auto',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
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
    color: '#667eea',
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    marginTop: '2rem',
    color: '#636e72'
  },
  link: {
    color: '#667eea',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  sideImage: {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    display: 'none'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
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
    marginBottom: '1rem'
  },
  progressBar: {
    height: '5px',
    borderRadius: '3px',
    marginTop: '1.5rem'
  }
};


// Media query for side image
const mediaQuery = window.matchMedia('(min-width: 768px)');
if (mediaQuery.matches) {
  styles.sideImage.display = 'block';
}


// Mobile responsive for dialog
const mediaQueryMobile = window.matchMedia('(max-width: 480px)');
if (mediaQueryMobile.matches) {
  styles.dialogBox.padding = '2rem 1.5rem';
  styles.dialogBox.maxWidth = '360px';
  styles.dialogTitle.fontSize = '1.5rem';
  styles.dialogMessage.fontSize = '1rem';
}


export default Login;
