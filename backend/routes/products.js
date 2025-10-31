const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

// Admin auth middleware (from admin.js or separate file)
const adminAuth = async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const Admin = require('../models/Admin');
    
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// ===== ADMIN ROUTES =====

// Image upload endpoint
router.post('/upload-images', adminAuth, upload.array('images', 5), (req, res) => {
  try {
    console.log('📤 Image upload request received');
    console.log('Files:', req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Get base URL from environment or request
    const baseURL = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    const imageUrls = req.files.map(file => {
      return `${baseURL}/uploads/${file.filename}`;
    });

    console.log('✅ Images uploaded:', imageUrls);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: imageUrls
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ message: 'Failed to upload images', error: error.message });
  }
});

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get featured products (public)
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .limit(8)
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create product (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('📝 Creating product:', req.body);

    const product = new Product(req.body);
    await product.save();

    console.log('✅ Product created:', product._id);
    res.status(201).json({ 
      success: true,
      message: 'Product created successfully',
      product 
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    console.log('🔄 Updating product:', req.params.id);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('✅ Product updated');
    res.json({ 
      success: true,
      message: 'Product updated successfully',
      product 
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    console.log('🗑️ Deleting product:', req.params.id);

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Optional: Delete associated images from filesystem
    // (Implementation depends on your image storage strategy)

    console.log('✅ Product deleted');
    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

module.exports = router;
