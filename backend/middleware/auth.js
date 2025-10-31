const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('❌ No Authorization header');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      console.log('❌ Token is empty after extraction');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('✅ Token received (first 20 chars):', token.substring(0, 20) + '...');
    console.log('✅ Token length:', token.length);
    console.log('✅ JWT_SECRET exists:', !!process.env.JWT_SECRET);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully:', decoded);

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', error: error.message });
    }
    return res.status(401).json({ message: 'Please authenticate', error: error.message });
  }
};

module.exports = auth;
