const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Sarees', 'Kurtis', 'Lehengas', 'Salwar', 'Gowns', 'Tops', 'Dresses']
  },
  sizes: {
    type: [String],
    required: [true, 'At least one size is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one size must be selected'
    }
  },
  colors: {
    type: [String],
    required: [true, 'At least one color is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one color must be selected'
    }
  },
  images: {
    type: [String],
    required: [true, 'At least one image is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one image is required'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
