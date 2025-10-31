const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const upload = require('../middleware/upload');

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin) {
      return res.status(403).json({ message: 'Admin not found' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Upload multiple images
router.post('/upload-images', adminAuth, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => {
      return `http://localhost:5000/uploads/${file.filename}`;
    });

    res.json({ 
      message: 'Images uploaded successfully',
      images: imageUrls 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all products (admin view)
router.get('/', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add new product
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('Received product data:', req.body);

    // Validate required fields
    if (!req.body.name || !req.body.price || !req.body.category) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, price, category' 
      });
    }

    if (!req.body.images || req.body.images.length === 0) {
      return res.status(400).json({ 
        message: 'At least one image is required' 
      });
    }

    if (!req.body.sizes || req.body.sizes.length === 0) {
      return res.status(400).json({ 
        message: 'At least one size must be selected' 
      });
    }

    if (!req.body.colors || req.body.colors.length === 0) {
      return res.status(400).json({ 
        message: 'At least one color must be selected' 
      });
    }

    const productData = {
      name: req.body.name,
      description: req.body.description || '',
      price: Number(req.body.price),
      category: req.body.category,
      sizes: req.body.sizes,
      colors: req.body.colors,
      images: req.body.images,
      stock: Number(req.body.stock) || 0,
      featured: req.body.featured || false
    };

    const product = new Product(productData);
    await product.save();
    
    console.log('Product saved successfully:', product._id);
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ 
      message: 'Failed to add product', 
      error: error.message 
    });
  }
});

// Update product
router.put('/:id', adminAuth, async (req, res) => {
  try {
    console.log('Updating product:', req.params.id);
    console.log('Update data:', req.body);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Product updated successfully');
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      message: 'Failed to update product', 
      error: error.message 
    });
  }
});

// Delete product
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
