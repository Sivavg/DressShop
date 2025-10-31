import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiUpload, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [dialog, setDialog] = useState({
    show: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Sarees',
    sizes: [],
    colors: [],
    images: [],
    stock: '',
    featured: false
  });

  const categories = ['Sarees', 'Kurtis', 'Lehengas', 'Salwar', 'Gowns', 'Tops', 'Dresses'];
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'White', 'Black', 'Purple', 'Orange', 'Brown'];

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
  }, []);

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

  const showDialog = (type, title, message, onConfirm = null, onCancel = null) => {
    setDialog({
      show: true,
      type,
      title,
      message,
      onConfirm: onConfirm || closeDialog,
      onCancel: onCancel || closeDialog
    });
  };

  const closeDialog = () => {
    setDialog({ ...dialog, show: false });
    setDeleteProductId(null);
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 5) {
      showDialog('error', 'Too Many Images', 'Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);

    try {
      const token = localStorage.getItem('adminToken');
      const uploadFormData = new FormData();
      
      Array.from(files).forEach(file => {
        uploadFormData.append('images', file);
      });

      const response = await api.post('/admin/products/upload-images', uploadFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload response:', response.data);

      // Handle image URLs - they might be full URLs or relative paths
      const imageUrls = response.data.images.map(url => {
        // If URL already starts with http, use as is
        if (url.startsWith('http')) {
          return url;
        }
        // If relative path, construct full URL using API base URL
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const backendURL = baseURL.replace('/api', ''); // Remove /api to get base backend URL
        return `${backendURL}${url}`;
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));

      showDialog('success', 'Upload Successful', `${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      showDialog('error', 'Upload Failed', error.response?.data?.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.images.length === 0) {
      showDialog('error', 'Validation Error', 'Please upload at least one image');
      return;
    }

    if (formData.sizes.length === 0) {
      showDialog('error', 'Validation Error', 'Please select at least one size');
      return;
    }

    if (formData.colors.length === 0) {
      showDialog('error', 'Validation Error', 'Please select at least one color');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        sizes: formData.sizes,
        colors: formData.colors,
        images: formData.images,
        stock: Number(formData.stock),
        featured: formData.featured
      };

      console.log('Submitting product data:', productData);

      if (editMode) {
        await api.put(`/admin/products/${currentProduct._id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        resetForm();
        fetchProducts();
        showDialog('success', 'Update Successful', 'Product updated successfully!');
      } else {
        await api.post('/admin/products', productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        resetForm();
        fetchProducts();
        showDialog('success', 'Product Added', 'Product added successfully!');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      showDialog('error', 'Save Failed', error.response?.data?.message || 'Failed to save product. Please check all fields.');
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      sizes: product.sizes,
      colors: product.colors,
      images: product.images,
      stock: product.stock,
      featured: product.featured
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteProductId(id);
    showDialog(
      'confirm',
      'Confirm Delete',
      'Are you sure you want to delete this product? This action cannot be undone.',
      () => confirmDelete(id),
      closeDialog
    );
  };

  const confirmDelete = async (id) => {
    closeDialog();
    
    try {
      const token = localStorage.getItem('adminToken');
      await api.delete(`/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      setTimeout(() => {
        showDialog('success', 'Delete Successful', 'Product deleted successfully!');
      }, 300);
    } catch (error) {
      console.error('Error deleting product:', error);
      setTimeout(() => {
        showDialog('error', 'Delete Failed', 'Failed to delete product. Please try again.');
      }, 300);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Sarees',
      sizes: [],
      colors: [],
      images: [],
      stock: '',
      featured: false
    });
    setCurrentProduct(null);
    setEditMode(false);
    setShowForm(false);
  };

  const toggleSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const toggleColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const getDialogIcon = () => {
    const iconSize = 60;
    switch (dialog.type) {
      case 'success':
        return <FiCheckCircle size={iconSize} color="#00b894" />;
      case 'error':
        return <FiXCircle size={iconSize} color="#d63031" />;
      case 'confirm':
        return <FiAlertCircle size={iconSize} color="#fdcb6e" />;
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
      case 'confirm':
        return { bg: '#fff9e6', border: '#fdcb6e', btnBg: '#d63031' };
      default:
        return { bg: '#f0f3ff', border: '#667eea', btnBg: '#667eea' };
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loader}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Products Management</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            style={styles.addButton}
          >
            <FiPlus size={20} />
            Add Product
          </motion.button>
        </div>

        {/* Products Grid */}
        <div style={styles.productsGrid}>
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={styles.productCard}
            >
              <div style={styles.productImage}>
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  style={styles.image}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                  }}
                />
                {product.stock === 0 && (
                  <div style={styles.outOfStockBadge}>OUT OF STOCK</div>
                )}
                {product.featured && (
                  <div style={styles.featuredBadge}>FEATURED</div>
                )}
              </div>
              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productCategory}>{product.category}</p>
                <p style={styles.productPrice}>₹{product.price}</p>
                <p style={styles.productStock}>Stock: {product.stock}</p>
              </div>
              <div style={styles.productActions}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(product)}
                  style={styles.editButton}
                >
                  <FiEdit2 size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteClick(product._id)}
                  style={styles.deleteButton}
                >
                  <FiTrash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div style={styles.noProducts}>
            <FiImage size={60} color="#dfe6e9" />
            <h3>No products yet</h3>
            <p>Add your first product to get started</p>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.modalOverlay}
              onClick={resetForm}
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                style={styles.modal}
              >
                <div style={styles.modalHeader}>
                  <h2>{editMode ? 'Edit Product' : 'Add New Product'}</h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetForm}
                    style={styles.closeButton}
                  >
                    <FiX size={24} />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Product Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={styles.input}
                        required
                        placeholder="Enter product name"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={styles.input}
                        required
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        style={styles.input}
                        required
                        min="0"
                        placeholder="Enter price"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Stock *</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        style={styles.input}
                        required
                        min="0"
                        placeholder="Enter stock quantity"
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                      required
                      placeholder="Enter product description"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Sizes * (Select at least one)</label>
                    <div style={styles.checkboxGroup}>
                      {availableSizes.map(size => (
                        <motion.button
                          key={size}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSize(size)}
                          style={{
                            ...styles.checkboxButton,
                            background: formData.sizes.includes(size) ? '#d63031' : 'white',
                            color: formData.sizes.includes(size) ? 'white' : '#2d3436'
                          }}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Colors * (Select at least one)</label>
                    <div style={styles.checkboxGroup}>
                      {availableColors.map(color => (
                        <motion.button
                          key={color}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleColor(color)}
                          style={{
                            ...styles.checkboxButton,
                            background: formData.colors.includes(color) ? '#d63031' : 'white',
                            color: formData.colors.includes(color) ? 'white' : '#2d3436'
                          }}
                        >
                          {color}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Upload Images * (Max 5 images, {formData.images.length}/5)
                    </label>
                    
                    <div style={styles.uploadBox}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={styles.fileInput}
                        id="imageUpload"
                        disabled={uploadingImages || formData.images.length >= 5}
                      />
                      <label htmlFor="imageUpload" style={styles.uploadLabel}>
                        <FiUpload size={40} color={formData.images.length >= 5 ? '#dfe6e9' : '#d63031'} />
                        <p style={styles.uploadText}>
                          {uploadingImages 
                            ? 'Uploading...' 
                            : formData.images.length >= 5 
                            ? 'Maximum images reached' 
                            : 'Click to upload images'}
                        </p>
                        <p style={styles.uploadSubtext}>PNG, JPG, GIF up to 5MB each</p>
                      </label>
                    </div>

                    {/* Image Preview */}
                    {formData.images.length > 0 && (
                      <div style={styles.imagePreview}>
                        {formData.images.map((img, index) => (
                          <div key={index} style={styles.previewItem}>
                            <img 
                              src={img} 
                              alt={`Preview ${index + 1}`} 
                              style={styles.previewImage}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/120?text=Error';
                              }}
                            />
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeImage(index)}
                              style={styles.removeImageButton}
                            >
                              <FiX size={18} />
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      />
                      <span style={{ marginLeft: '0.5rem' }}>Featured Product (Show on homepage)</span>
                    </label>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={uploadingImages}
                    style={{
                      ...styles.submitButton,
                      opacity: uploadingImages ? 0.5 : 1,
                      cursor: uploadingImages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {editMode ? 'Update Product' : 'Add Product'}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success/Error/Confirm Dialog */}
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

                {dialog.type === 'confirm' ? (
                  <div style={styles.dialogButtons}>
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
                      Delete
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeDialog}
                    style={{
                      ...styles.dialogButton,
                      background: getDialogColors().btnBg
                    }}
                  >
                    OK
                  </motion.button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </AdminLayout>
  );
};

const styles = {
  loader: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#636e72'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.8rem 1.5rem',
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  productCard: {
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
  },
  productImage: {
    position: 'relative',
    height: '250px',
    overflow: 'hidden',
    background: '#f8f9fa'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  outOfStockBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: '#d63031',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  featuredBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#00b894',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  productInfo: {
    padding: '1.5rem'
  },
  productName: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.5rem'
  },
  productCategory: {
    fontSize: '0.9rem',
    color: '#636e72',
    marginBottom: '0.5rem'
  },
  productPrice: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#d63031',
    marginBottom: '0.3rem'
  },
  productStock: {
    fontSize: '0.9rem',
    color: '#636e72'
  },
  productActions: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #f8f9fa'
  },
  editButton: {
    flex: 1,
    padding: '0.8rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButton: {
    flex: 1,
    padding: '0.8rem',
    background: '#d63031',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  noProducts: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#636e72'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1rem'
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem',
    borderBottom: '1px solid #dfe6e9'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    color: '#636e72'
  },
  form: {
    padding: '2rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#2d3436'
  },
  input: {
    width: '100%',
    padding: '0.8rem',
    border: '2px solid #dfe6e9',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.3s ease'
  },
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  checkboxButton: {
    padding: '0.5rem 1rem',
    border: '2px solid #dfe6e9',
    borderRadius: '20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  uploadBox: {
    position: 'relative',
    border: '3px dashed #dfe6e9',
    borderRadius: '15px',
    padding: '3rem 2rem',
    textAlign: 'center',
    background: '#f8f9fa',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  fileInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    opacity: 0,
    cursor: 'pointer'
  },
  uploadLabel: {
    cursor: 'pointer',
    pointerEvents: 'none'
  },
  uploadText: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3436',
    margin: '1rem 0 0.5rem'
  },
  uploadSubtext: {
    fontSize: '0.9rem',
    color: '#636e72'
  },
  imagePreview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  previewItem: {
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  previewImage: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '10px'
  },
  removeImageButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: '#d63031',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500'
  },
  submitButton: {
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
    cursor: 'pointer'
  },
  dialogButtons: {
    display: 'flex',
    gap: '1rem'
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
  }
};

export default AdminProducts;
