const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for an order']
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number
    },
    priceAtPurchase: {
      type: Number
    }
  }],
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  },
  shippingAddress: {
    name: {
      type: String,
      required: [true, 'Shipping name is required']
    },
    street: {
      type: String,
      required: [true, 'Shipping street address is required']
    },
    city: {
      type: String,
      required: [true, 'Shipping city is required']
    },
    postalCode: {
      type: String,
      required: [true, 'Shipping postal code is required']
    },
    country: {
      type: String,
      required: [true, 'Shipping country is required']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  paymentIntentId: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
