const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Create order (Only logged-in users)
router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    // Check stock availability for all items
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ 
          message: `Product ${item.name} not found` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Only ${product.stock} left.` 
        });
      }

      if (product.stock === 0) {
        return res.status(400).json({ 
          message: `${product.name} is out of stock` 
        });
      }
    }

    // Create order
    const orderData = {
      user: req.user._id,
      items,
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'processing'
    };

    const order = new Order(orderData);
    await order.save();

    // Reduce stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    await order.populate('items.product');

    res.status(201).json({ 
      success: true, 
      message: 'Order placed successfully!',
      order 
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
