import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiMinus, FiPlus, FiArrowLeft, FiCheckCircle, FiX, FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import StockAlert from '../components/StockAlert';
import api from '../utils/api';


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Stock Alert State
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [stockAlertMessage, setStockAlertMessage] = useState('');

  // Success Dialog State
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Login Dialog State
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Image Viewer State
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);


  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (showSuccessDialog || showStockAlert || showImageViewer || showLoginDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSuccessDialog, showStockAlert, showImageViewer, showLoginDialog]);


  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      setSelectedSize(response.data.sizes[0] || '');
      setSelectedColor(response.data.colors[0] || '');
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleAddToCart = () => {
    if (!product) return;

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

    // Check if trying to order more than available
    if (quantity > product.stock) {
      setStockAlertMessage(`You are trying to order ${quantity} items, but only ${product.stock} ${product.stock === 1 ? 'is' : 'are'} available.`);
      setShowStockAlert(true);
      return;
    }

    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    addToCart(product, selectedSize, selectedColor, quantity);
    
    // Show success dialog
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


  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      setStockAlertMessage(`Maximum available stock is ${product.stock} ${product.stock === 1 ? 'item' : 'items'}.`);
      setShowStockAlert(true);
    }
  };


  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };


  // Image Viewer Functions
  const openImageViewer = (index) => {
    setViewerImageIndex(index);
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
  };

  const nextImage = () => {
    setViewerImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setViewerImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleKeyPress = (e) => {
    if (!showImageViewer) return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeImageViewer();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showImageViewer]);


  if (loading) {
    return (
      <div style={styles.loader}>
        <div style={styles.spinner}></div>
        <p>Loading product...</p>
      </div>
    );
  }


  if (!product) {
    return (
      <div style={styles.error}>
        <h2>Product not found</h2>
        <button onClick={() => navigate('/products')} style={styles.backBtn}>
          Go Back
        </button>
      </div>
    );
  }


  return (
    <div style={styles.container}>
      {/* Stock Alert Modal */}
      <StockAlert
        show={showStockAlert}
        message={stockAlertMessage}
        availableStock={product.stock}
        onClose={() => setShowStockAlert(false)}
      />

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
                style={styles.closeButtonLogin}
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

              <h2 style={styles.loginDialogTitle}>Login Required</h2>
              <p style={styles.loginDialogMessage}>
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

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {showImageViewer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeImageViewer}
              style={styles.imageViewerOverlay}
            />

            <motion.div
              initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              animate={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
              exit={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={styles.imageViewerDialog}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeImageViewer}
                style={styles.closeButton}
              >
                <FiX size={24} />
              </motion.button>

              {/* Image Counter */}
              <div style={styles.imageCounter}>
                {viewerImageIndex + 1} / {product.images.length}
              </div>

              {/* Main Image */}
              <motion.div
                key={viewerImageIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                style={styles.viewerImageWrapper}
              >
                <img
                  src={product.images[viewerImageIndex]}
                  alt={`${product.name} ${viewerImageIndex + 1}`}
                  style={styles.viewerImage}
                />
              </motion.div>

              {/* Navigation Buttons */}
              {product.images.length > 1 && (
                <div style={styles.navigationButtons}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevImage}
                    style={styles.navButton}
                  >
                    <FiChevronLeft size={30} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextImage}
                    style={styles.navButton}
                  >
                    <FiChevronRight size={30} />
                  </motion.button>
                </div>
              )}

              {/* Thumbnail Navigation */}
              {product.images.length > 1 && (
                <div style={styles.viewerThumbnails}>
                  {product.images.map((img, index) => (
                    <motion.img
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      onClick={() => setViewerImageIndex(index)}
                      style={{
                        ...styles.viewerThumbnail,
                        border: viewerImageIndex === index ? '3px solid #667eea' : '3px solid #dfe6e9',
                        opacity: viewerImageIndex === index ? 1 : 0.6
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Dialog */}
      <AnimatePresence>
        {showSuccessDialog && (
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
                {product.name} has been added to your cart
              </p>

              <div style={styles.productPreview}>
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  style={styles.previewImage}
                />
                <div style={styles.previewDetails}>
                  <p style={styles.previewName}>{product.name}</p>
                  <p style={styles.previewInfo}>
                    Size: <strong>{selectedSize}</strong> | Color: <strong>{selectedColor}</strong> | Qty: <strong>{quantity}</strong>
                  </p>
                  <p style={styles.previewPrice}>₹{product.price * quantity}</p>
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
                  onClick={() => navigate('/checkout')}
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


      <div className="container" style={styles.content}>
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/products')}
          style={styles.backButton}
        >
          <FiArrowLeft size={20} />
          Back to Products
        </motion.button>


        <div style={styles.productContainer}>
          {/* Images Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={styles.imagesSection}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => openImageViewer(selectedImage)}
              style={styles.mainImage}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                style={styles.mainImg}
              />
              
              {/* Click to View Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={styles.viewHint}
              >
                <p>🔍 Click to view full size</p>
              </motion.div>
              
              {/* Out of Stock Overlay */}
              {product.stock === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.outOfStockOverlay}
                >
                  <h2 style={styles.outOfStockText}>OUT OF STOCK</h2>
                </motion.div>
              )}
            </motion.div>

            <div style={styles.thumbnails}>
              {product.images.map((img, index) => (
                <motion.img
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  style={{
                    ...styles.thumbnail,
                    border: selectedImage === index ? '3px solid #667eea' : '3px solid transparent'
                  }}
                />
              ))}
            </div>
          </motion.div>


          {/* Details Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={styles.detailsSection}
          >
            <h1 style={styles.productName}>{product.name}</h1>
            <p style={styles.category}>{product.category}</p>

            {/* Stock Status */}
            <div style={styles.stockStatus}>
              {product.stock === 0 ? (
                <span style={styles.outOfStock}>❌ Out of Stock</span>
              ) : product.stock < 10 ? (
                <span style={styles.lowStock}>⚠️ Only {product.stock} left in stock!</span>
              ) : (
                <span style={styles.inStock}>✅ In Stock ({product.stock} available)</span>
              )}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              style={styles.priceTag}
            >
              ₹{product.price}
            </motion.div>

            <p style={styles.description}>{product.description}</p>

            {/* Size Selection */}
            <div style={styles.optionSection}>
              <h3 style={styles.optionTitle}>Select Size</h3>
              <div style={styles.options}>
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      ...styles.optionButton,
                      background: selectedSize === size ? '#667eea' : 'white',
                      color: selectedSize === size ? 'white' : '#2d3436'
                    }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div style={styles.optionSection}>
              <h3 style={styles.optionTitle}>Select Color</h3>
              <div style={styles.options}>
                {product.colors.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      ...styles.optionButton,
                      background: selectedColor === color ? '#667eea' : 'white',
                      color: selectedColor === color ? 'white' : '#2d3436'
                    }}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div style={styles.optionSection}>
              <h3 style={styles.optionTitle}>Quantity</h3>
              <div style={styles.quantityControl}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  style={{
                    ...styles.quantityButton,
                    opacity: quantity <= 1 ? 0.5 : 1
                  }}
                >
                  <FiMinus size={20} />
                </motion.button>
                <span style={styles.quantityValue}>{quantity}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={incrementQuantity}
                  disabled={product.stock === 0 || quantity >= product.stock}
                  style={{
                    ...styles.quantityButton,
                    opacity: (product.stock === 0 || quantity >= product.stock) ? 0.5 : 1
                  }}
                >
                  <FiPlus size={20} />
                </motion.button>
              </div>
              {quantity >= product.stock && product.stock > 0 && (
                <p style={styles.maxQuantityText}>Maximum quantity reached</p>
              )}
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: product.stock === 0 ? 1 : 1.05 }}
              whileTap={{ scale: product.stock === 0 ? 1 : 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                ...styles.addToCartButton,
                opacity: product.stock === 0 ? 0.5 : 1,
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                background: product.stock === 0 
                  ? '#95a5a6' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <FiShoppingCart size={24} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};


const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fa',
    paddingTop: '2rem',
    paddingBottom: '3rem'
  },
  content: {
    maxWidth: '1200px'
  },
  loader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1rem'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  error: {
    textAlign: 'center',
    padding: '3rem',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtn: {
    marginTop: '1rem',
    padding: '0.8rem 2rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.8rem 1.5rem',
    background: 'white',
    border: '2px solid #dfe6e9',
    borderRadius: '10px',
    color: '#2d3436',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '2rem',
    fontWeight: '500'
  },
  productContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    background: 'white',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  imagesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  mainImage: {
    position: 'relative',
    width: '100%',
    height: '500px',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    cursor: 'pointer'
  },
  mainImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  viewHint: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '0.8rem 1.5rem',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: '600',
    backdropFilter: 'blur(10px)'
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  },
  outOfStockText: {
    color: 'white',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  },
  thumbnails: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto'
  },
  thumbnail: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flexShrink: 0
  },
  detailsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  productName: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    lineHeight: 1.2
  },
  category: {
    fontSize: '1.1rem',
    color: '#636e72',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  stockStatus: {
    padding: '1rem',
    borderRadius: '10px',
    background: '#f8f9fa',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  outOfStock: {
    color: '#d63031'
  },
  lowStock: {
    color: '#ff6b6b'
  },
  inStock: {
    color: '#00b894'
  },
  priceTag: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#667eea'
  },
  description: {
    fontSize: '1.1rem',
    color: '#636e72',
    lineHeight: 1.8
  },
  optionSection: {
    paddingTop: '1rem',
    borderTop: '1px solid #dfe6e9'
  },
  optionTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1rem'
  },
  options: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  optionButton: {
    padding: '0.8rem 1.5rem',
    border: '2px solid #dfe6e9',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  quantityButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '2px solid #667eea',
    background: 'white',
    color: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.2rem',
    transition: 'all 0.3s ease'
  },
  quantityValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2d3436',
    minWidth: '50px',
    textAlign: 'center'
  },
  maxQuantityText: {
    color: '#ff6b6b',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginTop: '0.5rem'
  },
  addToCartButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1.5rem',
    color: 'white',
    border: 'none',
    borderRadius: '15px',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
  },
  // Image Viewer Styles
  imageViewerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    zIndex: 10000,
    backdropFilter: 'blur(10px)'
  },
  imageViewerDialog: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    background: 'white',
    padding: '2rem',
    borderRadius: '25px',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5)',
    zIndex: 10001,
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: '#f8f9fa',
    border: 'none',
    borderRadius: '50%',
    width: '45px',
    height: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#2d3436',
    zIndex: 10002,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  imageCounter: {
    textAlign: 'center',
    background: '#667eea',
    color: 'white',
    padding: '0.6rem 1.2rem',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  viewerImageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: '500px',
    overflow: 'hidden',
    borderRadius: '15px',
    background: '#f8f9fa'
  },
  viewerImage: {
    maxWidth: '100%',
    maxHeight: '500px',
    objectFit: 'contain',
    borderRadius: '15px'
  },
  navigationButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem'
  },
  navButton: {
    flex: 1,
    padding: '1rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },
  viewerThumbnails: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '15px',
    justifyContent: 'center'
  },
  viewerThumbnail: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flexShrink: 0
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
  // Login Dialog Styles - EXACT SAME AS SUCCESS DIALOG
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
  closeButtonLogin: {
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
  loginDialogTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: '1rem'
  },
  loginDialogMessage: {
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


// Responsive - Mobile
const mediaQuery = window.matchMedia('(max-width: 768px)');
if (mediaQuery.matches) {
  styles.productContainer.gridTemplateColumns = '1fr';
  styles.productContainer.padding = '1.5rem';
  styles.productContainer.gap = '2rem';
  styles.mainImage.height = '350px';
  styles.productName.fontSize = '1.8rem';
  styles.priceTag.fontSize = '2rem';
  styles.description.fontSize = '1rem';
  styles.optionTitle.fontSize = '1rem';
  styles.optionButton.padding = '0.6rem 1rem';
  styles.optionButton.fontSize = '0.9rem';
  styles.quantityButton.width = '45px';
  styles.quantityButton.height = '45px';
  styles.quantityValue.fontSize = '1.5rem';
  styles.addToCartButton.fontSize = '1.1rem';
  styles.addToCartButton.padding = '1.2rem';
  styles.thumbnail.width = '80px';
  styles.thumbnail.height = '80px';
  styles.outOfStockText.fontSize = '1.5rem';
  styles.successDialog.padding = '2rem 1.5rem';
  styles.successDialog.maxWidth = '380px';
  styles.successTitle.fontSize = '1.5rem';
  styles.successMessage.fontSize = '1rem';
  styles.previewImage.width = '60px';
  styles.previewImage.height = '60px';
  styles.dialogButtons.flexDirection = 'column';
  styles.imageViewerDialog.padding = '1.5rem';
  styles.imageViewerDialog.maxWidth = '95%';
  styles.viewerImageWrapper.maxHeight = '350px';
  styles.viewerImage.maxHeight = '350px';
  styles.closeButton.top = '10px';
  styles.closeButton.right = '10px';
  styles.closeButton.width = '40px';
  styles.closeButton.height = '40px';
  styles.viewerThumbnail.width = '60px';
  styles.viewerThumbnail.height = '60px';
  styles.imageCounter.fontSize = '0.85rem';
  styles.imageCounter.padding = '0.5rem 1rem';
  styles.navButton.padding = '0.8rem';
  styles.loginDialog.padding = '2rem 1.5rem';
  styles.loginDialog.maxWidth = '380px';
  styles.loginDialogTitle.fontSize = '1.5rem';
  styles.loginDialogMessage.fontSize = '1rem';
}


// Responsive - Tablet
const tabletQuery = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');
if (tabletQuery.matches) {
  styles.productContainer.gap = '2rem';
  styles.mainImage.height = '400px';
  styles.productName.fontSize = '2rem';
  styles.priceTag.fontSize = '2.5rem';
  styles.imageViewerDialog.maxWidth = '750px';
}


export default ProductDetail;
