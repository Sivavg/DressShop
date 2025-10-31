import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiSearch, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useSearchParams } from 'react-router-dom';


const Products = () => {
  const { addToCart, user, cart } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [stockAlertMessage, setStockAlertMessage] = useState('');
  const [addedProduct, setAddedProduct] = useState(null);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: '',
    search: ''
  });


  const categories = ['Sarees', 'Kurtis', 'Lehengas', 'Salwar', 'Gowns', 'Tops', 'Dresses'];
  const priceRanges = [
    { label: 'Under ₹1000', min: 0, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
    { label: 'Above ₹5000', min: 5000, max: Infinity }
  ];


  useEffect(() => {
    fetchProducts();
  }, []);


  useEffect(() => {
    filterProducts();
  }, [filters, products]);

  useEffect(() => {
    if (showLoginDialog || showSuccessDialog || showStockAlert) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLoginDialog, showSuccessDialog, showStockAlert]);


  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };


  const filterProducts = () => {
    let filtered = [...products];

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.priceRange) {
      const range = priceRanges.find(r => r.label === filters.priceRange);
      if (range) {
        filtered = filtered.filter(p => p.price >= range.min && p.price <= range.max);
      }
    }

    if (filters.search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };


  const handleAddToCart = (product) => {
    // Check if user is logged in
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    // Check if product is out of stock
    if (product.stock === 0) {
      setStockAlertMessage('This product is currently out of stock!');
      setShowStockAlert(true);
      return;
    }

    // Check how many items of this product are already in cart
    const existingCartItem = cart.find(item => item._id === product._id);
    const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;

    // Check if adding one more would exceed stock
    if (currentQuantityInCart >= product.stock) {
      setStockAlertMessage(`Maximum available stock is ${product.stock} ${product.stock === 1 ? 'item' : 'items'}. You already have ${currentQuantityInCart} in your cart.`);
      setShowStockAlert(true);
      return;
    }
    
    addToCart(product, 'M', product.colors[0], 1);
    
    // Show success dialog
    setAddedProduct(product);
    setShowSuccessDialog(true);
    
    // Auto close after 3 seconds
    setTimeout(() => {
      setShowSuccessDialog(false);
    }, 3000);
  };

  const handleLoginClick = () => {
    setShowLoginDialog(false);
    navigate('/login');
  };

  const handleRegisterClick = () => {
    setShowLoginDialog(false);
    navigate('/register');
  };


  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category: filters.category === category ? '' : category });
  };


  const handlePriceChange = (priceRange) => {
    setFilters({ ...filters, priceRange: filters.priceRange === priceRange ? '' : priceRange });
  };


  const clearFilters = () => {
    setFilters({ category: '', priceRange: '', search: '' });
    setShowFilters(false);
  };


  return (
    <div style={styles.container}>
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
                style={styles.dialogCloseButton}
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

      {/* Stock Alert Dialog */}
      <AnimatePresence>
        {showStockAlert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStockAlert(false)}
              style={styles.dialogOverlay}
            />

            <motion.div
              initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              animate={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
              exit={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={styles.stockAlertDialog}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowStockAlert(false)}
                style={styles.dialogCloseButton}
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
                <FiAlertCircle size={70} color="#d63031" />
              </motion.div>

              <h2 style={styles.stockAlertTitle}>Product Not Available</h2>
              <p style={styles.stockAlertMessage}>
                {stockAlertMessage}
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStockAlert(false)}
                style={styles.stockOkButton}
              >
                OK
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Dialog */}
      <AnimatePresence>
        {showSuccessDialog && addedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessDialog(false)}
              style={styles.dialogOverlay}
            />

            <motion.div
              initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              animate={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
              exit={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={styles.successDialog}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.6 }}
                style={styles.successIcon}
              >
                <FiCheckCircle size={70} color="#00b894" />
              </motion.div>

              <h2 style={styles.successTitle}>Added to Cart!</h2>
              <p style={styles.successMessage}>
                {addedProduct.name} has been added to your cart
              </p>

              <div style={styles.productPreview}>
                <img 
                  src={addedProduct.images[0]} 
                  alt={addedProduct.name} 
                  style={styles.previewImage}
                />
                <div style={styles.previewDetails}>
                  <p style={styles.previewName}>{addedProduct.name}</p>
                  <p style={styles.previewInfo}>
                    Size: <strong>M</strong> | Color: <strong>{addedProduct.colors[0]}</strong> | Qty: <strong>1</strong>
                  </p>
                  <p style={styles.previewPrice}>₹{addedProduct.price}</p>
                </div>
              </div>

              <div style={styles.dialogButtons}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSuccessDialog(false)}
                  style={styles.continueButton}
                >
                  Continue Shopping
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowSuccessDialog(false);
                    navigate('/checkout');
                  }}
                  style={styles.viewCartButton}
                >
                  View Cart
                </motion.button>
              </div>

              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                style={styles.progressBar}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <div className="container">
          <h1 style={styles.title}>Our Products</h1>
          <p style={styles.subtitle}>
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </motion.div>


      <div className="container" style={styles.content}>
        {/* Mobile Filter Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          style={styles.filterToggle}
        >
          <FiFilter size={20} />
          Filters
        </motion.button>


        <div style={styles.productsContainer}>
          {/* Desktop Filters Sidebar */}
          <aside style={styles.desktopSidebar}>
            <div style={styles.filterHeader}>
              <h3 style={styles.filterTitle}>Filters</h3>
            </div>

            {/* Search */}
            <div style={styles.filterSection}>
              <h4 style={styles.filterSectionTitle}>Search</h4>
              <div style={styles.searchBox}>
                <FiSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  style={styles.searchInput}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div style={styles.filterSection}>
              <h4 style={styles.filterSectionTitle}>Category</h4>
              {categories.map((category) => (
                <motion.label
                  key={category}
                  whileHover={{ x: 5 }}
                  style={styles.filterOption}
                >
                  <input
                    type="checkbox"
                    checked={filters.category === category}
                    onChange={() => handleCategoryChange(category)}
                    style={styles.checkbox}
                  />
                  <span style={styles.filterLabel}>{category}</span>
                </motion.label>
              ))}
            </div>

            {/* Price Range Filter */}
            <div style={styles.filterSection}>
              <h4 style={styles.filterSectionTitle}>Price Range</h4>
              {priceRanges.map((range) => (
                <motion.label
                  key={range.label}
                  whileHover={{ x: 5 }}
                  style={styles.filterOption}
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceRange === range.label}
                    onChange={() => handlePriceChange(range.label)}
                    style={styles.checkbox}
                  />
                  <span style={styles.filterLabel}>{range.label}</span>
                </motion.label>
              ))}
            </div>

            {/* Clear Filters */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              style={styles.clearButton}
            >
              Clear All Filters
            </motion.button>
          </aside>


          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                style={styles.overlay}
              />
            )}
          </AnimatePresence>


          {/* Mobile Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                style={styles.mobileSidebar}
              >
                <div style={styles.filterHeader}>
                  <h3 style={styles.filterTitle}>Filters</h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowFilters(false)}
                    style={styles.closeButton}
                  >
                    <FiX size={24} />
                  </motion.button>
                </div>

                <div style={styles.sidebarContent}>
                  {/* Search */}
                  <div style={styles.filterSection}>
                    <h4 style={styles.filterSectionTitle}>Search</h4>
                    <div style={styles.searchBox}>
                      <FiSearch style={styles.searchIcon} />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        style={styles.searchInput}
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div style={styles.filterSection}>
                    <h4 style={styles.filterSectionTitle}>Category</h4>
                    {categories.map((category) => (
                      <motion.label
                        key={category}
                        whileHover={{ x: 5 }}
                        style={styles.filterOption}
                      >
                        <input
                          type="checkbox"
                          checked={filters.category === category}
                          onChange={() => handleCategoryChange(category)}
                          style={styles.checkbox}
                        />
                        <span style={styles.filterLabel}>{category}</span>
                      </motion.label>
                    ))}
                  </div>

                  {/* Price Range Filter */}
                  <div style={styles.filterSection}>
                    <h4 style={styles.filterSectionTitle}>Price Range</h4>
                    {priceRanges.map((range) => (
                      <motion.label
                        key={range.label}
                        whileHover={{ x: 5 }}
                        style={styles.filterOption}
                      >
                        <input
                          type="radio"
                          name="priceRange"
                          checked={filters.priceRange === range.label}
                          onChange={() => handlePriceChange(range.label)}
                          style={styles.checkbox}
                        />
                        <span style={styles.filterLabel}>{range.label}</span>
                      </motion.label>
                    ))}
                  </div>

                  {/* Clear Filters */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    style={styles.clearButton}
                  >
                    Clear All Filters
                  </motion.button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>


          {/* Products Grid */}
          <main style={styles.main}>
            {loading ? (
              <div style={styles.loader}>Loading products...</div>
            ) : filteredProducts.length > 0 ? (
              <div style={styles.productsGrid}>
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.noProducts}
              >
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  style={styles.resetButton}
                >
                  Reset Filters
                </motion.button>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};


const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fa'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '3rem 0',
    marginBottom: '2rem'
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 2.5rem)',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '1.1rem',
    opacity: 0.9
  },
  content: {
    paddingBottom: '3rem'
  },
  filterToggle: {
    display: 'none',
    width: '100%',
    padding: '1rem',
    background: 'white',
    border: '2px solid #dfe6e9',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3436',
    cursor: 'pointer',
    marginBottom: '1rem',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
  },
  productsContainer: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '2rem',
    position: 'relative'
  },
  desktopSidebar: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    display: 'block'
  },
  mobileSidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '300px',
    maxWidth: '80vw',
    background: 'white',
    zIndex: 2000,
    boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
    display: 'none'
  },
  sidebarContent: {
    padding: '1rem 2rem',
    overflowY: 'auto',
    height: 'calc(100vh - 80px)'
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f8f9fa'
  },
  filterTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: 0
  },
  closeButton: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: '#636e72',
    cursor: 'pointer',
    padding: '0.5rem'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1500,
    backdropFilter: 'blur(2px)',
    display: 'none'
  },
  filterSection: {
    marginBottom: '2rem'
  },
  filterSectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1rem'
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#667eea',
    fontSize: '1.2rem'
  },
  searchInput: {
    width: '100%',
    padding: '0.8rem 1rem 0.8rem 3rem',
    border: '2px solid #dfe6e9',
    borderRadius: '10px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.3s ease'
  },
  filterOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '0.8rem',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background 0.3s ease',
    marginBottom: '0.5rem'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#667eea'
  },
  filterLabel: {
    fontSize: '0.95rem',
    color: '#2d3436'
  },
  clearButton: {
    width: '100%',
    padding: '0.8rem',
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem'
  },
  main: {
    minHeight: '400px'
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
  noProducts: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
  },
  resetButton: {
    marginTop: '1rem',
    padding: '0.8rem 2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  // Dialog Overlay
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
  // Login Dialog Styles
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
  // Stock Alert Dialog Styles
  stockAlertDialog: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    background: '#ffe6e6',
    padding: '2.5rem 2rem',
    borderRadius: '25px',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
    border: '4px solid #d63031'
  },
  stockAlertTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#d63031',
    marginBottom: '1rem'
  },
  stockAlertMessage: {
    fontSize: '1.1rem',
    color: '#2d3436',
    marginBottom: '2rem',
    lineHeight: 1.6
  },
  stockOkButton: {
    width: '100%',
    padding: '1rem',
    background: '#d63031',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  dialogCloseButton: {
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
  },
  // Success Dialog Styles
  successDialog: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    background: '#e8f5e9',
    padding: '2.5rem 2rem',
    borderRadius: '25px',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    maxWidth: '550px',
    width: '90%',
    textAlign: 'center',
    border: '4px solid #00b894'
  },
  successIcon: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center'
  },
  successTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: '0.5rem'
  },
  successMessage: {
    fontSize: '1.1rem',
    color: '#2d3436',
    marginBottom: '1.5rem'
  },
  productPreview: {
    display: 'flex',
    gap: '1rem',
    background: 'white',
    padding: '1rem',
    borderRadius: '15px',
    marginBottom: '1.5rem',
    alignItems: 'center',
    textAlign: 'left'
  },
  previewImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '10px'
  },
  previewDetails: {
    flex: 1
  },
  previewName: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.3rem'
  },
  previewInfo: {
    fontSize: '0.85rem',
    color: '#636e72',
    marginBottom: '0.3rem'
  },
  previewPrice: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#667eea'
  },
  continueButton: {
    flex: 1,
    padding: '1rem',
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  viewCartButton: {
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
  progressBar: {
    height: '5px',
    background: '#00b894',
    borderRadius: '3px'
  }
};


// Mobile responsive
const mediaQuery = window.matchMedia('(max-width: 768px)');
if (mediaQuery.matches) {
  styles.productsContainer.gridTemplateColumns = '1fr';
  styles.filterToggle.display = 'flex';
  styles.desktopSidebar.display = 'none';
  styles.mobileSidebar.display = 'block';
  styles.closeButton.display = 'block';
  styles.overlay.display = 'block';
  styles.loginDialog.padding = '2rem 1.5rem';
  styles.loginDialog.maxWidth = '380px';
  styles.dialogTitle.fontSize = '1.5rem';
  styles.dialogMessage.fontSize = '1rem';
  styles.dialogButtons.flexDirection = 'column';
  styles.successDialog.padding = '2rem 1.5rem';
  styles.successDialog.maxWidth = '380px';
  styles.successTitle.fontSize = '1.5rem';
  styles.successMessage.fontSize = '1rem';
  styles.previewImage.width = '60px';
  styles.previewImage.height = '60px';
  styles.stockAlertDialog.padding = '2rem 1.5rem';
  styles.stockAlertDialog.maxWidth = '380px';
  styles.stockAlertTitle.fontSize = '1.5rem';
  styles.stockAlertMessage.fontSize = '1rem';
}


export default Products;
