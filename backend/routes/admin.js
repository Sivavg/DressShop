const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('❌ No Authorization header');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({ message: 'Access denied. Invalid token format.' });
    }

    console.log('🔐 Verifying admin token...');

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', { adminId: decoded.adminId });

    const admin = await Admin.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      console.log('❌ Admin not found for ID:', decoded.adminId);
      return res.status(403).json({ message: 'Access denied. Admin account not found.' });
    }

    console.log('✅ Admin authenticated:', admin.email);

    req.admin = admin;
    next();
  } catch (error) {
    console.error('❌ Admin auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Admin login attempt:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      console.log('❌ Admin not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Admin found:', admin.email);

    // Check password
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password verified');

    // Generate token
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { adminId: admin._id.toString() }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    console.log('✅ Admin login successful:', admin.email);
    console.log('✅ Token generated');

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Create default admin (Remove this endpoint in production!)
router.post('/create-default', async (req, res) => {
  try {
    // Security check - only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'This endpoint is disabled in production' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dressshop.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    console.log('📝 Creating default admin...');
    console.log('Email:', adminEmail);

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin already exists');
      return res.json({ 
        message: 'Admin already exists', 
        email: adminEmail,
        note: 'Use this email to login'
      });
    }

    // Create new admin
    const admin = new Admin({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    await admin.save();
    
    console.log('✅ Default admin created successfully');
    
    res.status(201).json({ 
      success: true,
      message: 'Admin created successfully',
      credentials: {
        email: adminEmail,
        password: adminPassword
      },
      note: 'Please change the password after first login'
    });
  } catch (error) {
    console.error('❌ Create admin error:', error);
    res.status(500).json({ message: 'Failed to create admin', error: error.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Admin routes working',
    timestamp: new Date().toISOString(),
    jwtConfigured: !!process.env.JWT_SECRET
  });
});

// Get Dashboard Stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats for:', req.admin.email);

    const [totalUsers, totalOrders, revenueData, recentOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.find()
        .populate('user', 'name email phone')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const stats = {
      totalUsers,
      totalOrders,
      totalRevenue: revenueData[0]?.total || 0,
      recentOrders
    };

    console.log('✅ Stats fetched successfully');
    res.json(stats);
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

// Get All Users
router.get('/users', adminAuth, async (req, res) => {
  try {
    console.log('👥 Fetching all users');
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get Single User with Orders
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    console.log('👤 Fetching user:', req.params.id);
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ user: req.params.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    console.log(`✅ User found with ${orders.length} orders`);
    res.json({ user, orders });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// Get All Orders
router.get('/orders', adminAuth, async (req, res) => {
  try {
    console.log('📦 Fetching all orders');
    
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Get Single Order
router.get('/orders/:id', adminAuth, async (req, res) => {
  try {
    console.log('📦 Fetching order:', req.params.id);
    
    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('✅ Order found');
    res.json(order);
  } catch (error) {
    console.error('❌ Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

// Update Order Status
router.patch('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    console.log(`🔄 Updating order ${req.params.id} status`);
    console.log('New status:', { orderStatus, paymentStatus });
    
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    if (orderStatus) {
      // Validate order status
      const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      order.orderStatus = orderStatus;
    }
    
    if (paymentStatus) {
      // Validate payment status
      const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    console.log('✅ Order status updated successfully');
    res.json({ 
      success: true,
      message: 'Order status updated successfully', 
      order 
    });
  } catch (error) {
    console.error('❌ Update order error:', error);
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
});

// Delete User (Optional - be careful with this!)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    console.log('🗑️ Deleting user:', req.params.id);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: Delete user's orders too
    await Order.deleteMany({ user: req.params.id });
    
    await User.findByIdAndDelete(req.params.id);

    console.log('✅ User deleted successfully');
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

module.exports = router;
