import React from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const phoneNumber = '919876543210'; // Replace with your number

  const handleCall = () => {
    window.location.href = `tel:+${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.footer}
    >
      <div className="container" style={styles.container}>
        <div style={styles.grid}>
          {/* About Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={styles.section}
          >
            <h3 style={styles.heading}>DressShop</h3>
            <p style={styles.text}>
              Your one-stop destination for trendy and traditional ethnic wear. 
              Quality dresses at affordable prices.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={styles.section}
          >
            <h4 style={styles.subHeading}>Quick Links</h4>
            <ul style={styles.list}>
              <li><a href="/" style={styles.link}>Home</a></li>
              <li><a href="/products" style={styles.link}>Products</a></li>
              <li><a href="/products?category=Sarees" style={styles.link}>Sarees</a></li>
              <li><a href="/products?category=Lehengas" style={styles.link}>Lehengas</a></li>
            </ul>
          </motion.div>

          {/* Contact Section with Click-to-Call */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={styles.section}
          >
            <h4 style={styles.subHeading}>Contact Us</h4>
            <div style={styles.contactInfo}>
              <motion.div
                whileHover={{ scale: 1.05, x: 5 }}
                style={styles.contactItem}
                onClick={handleCall}
              >
                <FiPhone style={styles.icon} />
                <span style={styles.clickable}>+91 1234567890</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, x: 5 }}
                style={styles.contactItem}
                onClick={handleWhatsApp}
              >
                <FaWhatsapp style={styles.icon} />
                <span style={styles.clickable}>WhatsApp Us</span>
              </motion.div>

              <div style={styles.contactItem}>
                <FiMail style={styles.icon} />
                <a href="mailto:support@dressshop.com" style={styles.link}>
                  support@dressshop.com
                </a>
              </div>

              <div style={styles.contactItem}>
                <FiMapPin style={styles.icon} />
                <span>Chennai, Tamil Nadu, India</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Social Media */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={styles.social}
        >
          <h4 style={styles.subHeading}>Follow Us</h4>
          <div style={styles.socialIcons}>
            <motion.a
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialIcon}
            >
              <FaFacebook size={24} />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialIcon}
            >
              <FaInstagram size={24} />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialIcon}
            >
              <FaTwitter size={24} />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWhatsApp}
              style={styles.socialIcon}
            >
              <FaWhatsapp size={24} />
            </motion.a>
          </div>
        </motion.div>

        {/* Copyright */}
        <div style={styles.copyright}>
          <p>© 2025 DressShop. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

const styles = {
  footer: {
    background: 'linear-gradient(135deg, #2d3436 0%, #000000 100%)',
    color: 'white',
    padding: '3rem 0 1rem',
    marginTop: 'auto'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
  },
  section: {
    padding: '1rem'
  },
  heading: {
    fontSize: '1.8rem',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subHeading: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
    color: '#dfe6e9'
  },
  text: {
    color: '#b2bec3',
    lineHeight: '1.6'
  },
  list: {
    listStyle: 'none',
    padding: 0
  },
  link: {
    color: '#b2bec3',
    textDecoration: 'none',
    display: 'block',
    padding: '0.5rem 0',
    transition: 'color 0.3s ease'
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    color: '#b2bec3',
    cursor: 'pointer'
  },
  icon: {
    color: '#667eea',
    fontSize: '1.2rem'
  },
  clickable: {
    cursor: 'pointer',
    transition: 'color 0.3s ease'
  },
  social: {
    textAlign: 'center',
    padding: '2rem 0',
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  socialIcons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    marginTop: '1rem'
  },
  socialIcon: {
    color: 'white',
    transition: 'color 0.3s ease'
  },
  copyright: {
    textAlign: 'center',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    color: '#636e72'
  }
};

export default Footer;
