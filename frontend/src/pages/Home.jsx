import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiTrendingUp, FiShield, FiTruck, FiAlertCircle, FiX } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';


const Home = () => {
  const { addToCart, user } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);


  useEffect(() => {
    fetchFeaturedProducts();
    // Preload hero image
    const img = new Image();
    img.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80';
    img.onload = () => setImageLoaded(true);
  }, []);


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


  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products/featured');
      setFeaturedProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleAddToCart = (product) => {
    // Check if user is logged in
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    
    addToCart(product, 'M', product.colors[0], 1);
  };


  const handleLoginClick = () => {
    setShowLoginDialog(false);
    navigate('/login');
  };


  const handleRegisterClick = () => {
    setShowLoginDialog(false);
    navigate('/register');
  };


  // Get unique categories from fetched products
  const categories = [...new Set(featuredProducts.map(product => product.category))];


  // Function to get emoji based on category name
  const getCategoryEmoji = (category) => {
    const categoryLower = category.toLowerCase();
    
    // Saree related
    if (categoryLower.includes('saree') || categoryLower.includes('sari')) return '🥻';
    
    // Kurti/Kurta related
    if (categoryLower.includes('kurti') || categoryLower.includes('kurta')) return '👘';
    
    // Lehenga related
    if (categoryLower.includes('lehenga') || categoryLower.includes('lehnga')) return '👗';
    
    // Salwar/Suit related
    if (categoryLower.includes('salwar') || categoryLower.includes('suit') || categoryLower.includes('churidar')) return '🧥';
    
    // Western dress
    if (categoryLower.includes('dress') || categoryLower.includes('gown') || categoryLower.includes('frock')) return '👗';
    
    // Top/Shirt
    if (categoryLower.includes('top') || categoryLower.includes('shirt') || categoryLower.includes('blouse')) return '👚';
    
    // Jeans/Pants
    if (categoryLower.includes('jeans') || categoryLower.includes('pant') || categoryLower.includes('trouser')) return '👖';
    
    // Skirt
    if (categoryLower.includes('skirt')) return '🩱';
    
    // Jacket/Coat
    if (categoryLower.includes('jacket') || categoryLower.includes('coat') || categoryLower.includes('blazer')) return '🧥';
    
    // Dupatta/Stole
    if (categoryLower.includes('dupatta') || categoryLower.includes('stole') || categoryLower.includes('scarf')) return '🧣';
    
    // Ethnic wear
    if (categoryLower.includes('ethnic') || categoryLower.includes('traditional') || categoryLower.includes('indo')) return '🥻';
    
    // Western wear
    if (categoryLower.includes('western') || categoryLower.includes('casual')) return '👔';
    
    // Formal wear
    if (categoryLower.includes('formal') || categoryLower.includes('office')) return '🎩';
    
    // Party wear
    if (categoryLower.includes('party') || categoryLower.includes('evening')) return '💃';
    
    // Bridal wear
    if (categoryLower.includes('bridal') || categoryLower.includes('wedding')) return '👰';
    
    // Kids wear
    if (categoryLower.includes('kids') || categoryLower.includes('children') || categoryLower.includes('baby')) return '👶';
    
    // Men's wear
    if (categoryLower.includes('men') || categoryLower.includes('gents')) return '🤵';
    
    // Women's wear
    if (categoryLower.includes('women') || categoryLower.includes('ladies')) return '👩';
    
    // Accessories
    if (categoryLower.includes('accessory') || categoryLower.includes('accessories') || categoryLower.includes('jewelry')) return '💍';
    
    // Default emoji for unmatched categories
    return '👗';
  };


  const features = [
    {
      icon: <FiTruck size={40} />,
      title: 'Free Delivery',
      description: 'On orders above ₹999'
    },
    {
      icon: <FiShield size={40} />,
      title: 'Secure Payment',
      description: '100% Cash on Delivery'
    },
    {
      icon: <FiTrendingUp size={40} />,
      title: 'Best Quality',
      description: 'Premium fabrics & designs'
    },
    {
      icon: <FiShoppingBag size={40} />,
      title: 'Easy Returns',
      description: '7 days return policy'
    }
  ];


  return (
    <div>
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

              <div style={styles.dialogButtons}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoginClick}
                  style={styles.loginButton}
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRegisterClick}
                  style={styles.registerButton}
                >
                  Register
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLoginDialog(false)}
                style={styles.cancelButton}
              >
                Continue Shopping
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          ...styles.hero,
          backgroundImage: imageLoaded 
            ? 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        {/* Dark overlay for text readability */}
        <div style={styles.overlay} />
        
        <div className="container" style={styles.heroContent}>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={styles.heroText}
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={styles.heroTitle}
            >
              Discover Your Perfect Style
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={styles.heroSubtitle}
            >
              Explore our exclusive collection of traditional and modern dresses
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Link to="/products">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(255, 255, 255, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  style={styles.ctaButton}
                >
                  Shop Now
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={styles.heroImage}
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={styles.floatingImage}
            >
              👗
            </motion.div>
          </motion.div>
        </div>
      </motion.section>


      {/* Shop by Category */}
      <section style={styles.section}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={styles.sectionHeader}
          >
            <h2 style={styles.sectionTitle}>Shop by Category</h2>
            <p style={styles.sectionSubtitle}>Browse our curated collections</p>
          </motion.div>


          {categories.length > 0 ? (
            <div style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <Link to={`/products?category=${category}`} key={category}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      y: -5
                    }}
                    style={styles.categoryCard}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      style={styles.categoryIcon}
                    >
                      {getCategoryEmoji(category)}
                    </motion.div>
                    <h3 style={styles.categoryName}>{category}</h3>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={styles.emptyMessage}>
              <p>No categories available yet. Admin can add products!</p>
              <Link to="/admin/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={styles.adminButton}
                >
                  Go to Admin Panel
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </section>


      {/* Featured Products */}
      <section style={styles.section}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={styles.sectionHeader}
          >
            <h2 style={styles.sectionTitle}>Featured Products</h2>
            <p style={styles.sectionSubtitle}>Handpicked just for you</p>
          </motion.div>


          {loading ? (
            <div style={styles.loader}>Loading products...</div>
          ) : featuredProducts.length > 0 ? (
            <div style={styles.productsGrid}>
              {featuredProducts.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyMessage}>
              <h3>No products yet!</h3>
              <p>Admin can add featured products from the admin panel.</p>
              <Link to="/admin/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={styles.adminButton}
                >
                  Go to Admin Panel
                </motion.button>
              </Link>
            </div>
          )}


          {featuredProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={styles.viewAllContainer}
            >
              <Link to="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={styles.viewAllButton}
                >
                  View All Products
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>


      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div className="container">
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                style={styles.featureCard}
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  style={styles.featureIcon}
                >
                  {feature.icon}
                </motion.div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};


const styles = {
  hero: {
    minHeight: '600px',
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'background-image 0.5s ease-in-out'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1
  },
  heroContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2
  },
  heroText: {
    zIndex: 2,
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: 1.2
  },
  heroSubtitle: {
    fontSize: 'clamp(1rem, 2vw, 1.3rem)',
    marginBottom: '2rem',
    opacity: 0.95
  },
  ctaButton: {
    padding: '1rem 3rem',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease'
  },
  heroImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  floatingImage: {
    fontSize: '15rem',
    textAlign: 'center',
    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
  },
  section: {
    padding: '5rem 0'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.5rem'
  },
  sectionSubtitle: {
    fontSize: '1.1rem',
    color: '#636e72'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem'
  },
  categoryCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid #000',
    position: 'relative'
  },
  categoryIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  categoryName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#636e72'
  },
  adminButton: {
    marginTop: '1rem',
    padding: '0.8rem 2rem',
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem'
  },
  loader: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#636e72'
  },
  viewAllContainer: {
    textAlign: 'center',
    marginTop: '3rem'
  },
  viewAllButton: {
    padding: '1rem 3rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },
  featuresSection: {
    background: '#f8f9fa',
    padding: '5rem 0'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem'
  },
  featureCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  },
  featureIcon: {
    color: '#667eea',
    marginBottom: '1rem'
  },
  featureTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.5rem'
  },
  featureDescription: {
    color: '#636e72',
    fontSize: '0.95rem'
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
    marginBottom: '2rem',
    lineHeight: 1.6
  },
  dialogButtons: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  },
  loginButton: {
    flex: 1,
    padding: '1rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  registerButton: {
    flex: 1,
    padding: '1rem',
    background: '#00b894',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelButton: {
    width: '100%',
    padding: '1rem',
    background: 'white',
    color: '#636e72',
    border: '2px solid #dfe6e9',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};


// Responsive styles
const mediaQuery = window.matchMedia('(max-width: 768px)');
if (mediaQuery.matches) {
  styles.heroContent.gridTemplateColumns = '1fr';
  styles.heroImage.display = 'none';
  styles.hero.minHeight = '500px';
  styles.loginDialog.padding = '2rem 1.5rem';
  styles.loginDialog.maxWidth = '380px';
  styles.dialogTitle.fontSize = '1.5rem';
  styles.dialogMessage.fontSize = '1rem';
  styles.dialogButtons.flexDirection = 'column';
}


export default Home;
