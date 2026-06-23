const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders/create
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { shippingAddress, paymentIntentId } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Fetch user's cart and populate items
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(422).json({ message: 'Cart is empty' });
    }

    // Calculate totalPrice by summing item.product.price * item.quantity
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(422).json({ message: 'One or more items in the cart are no longer available.' });
      }
      totalPrice += item.product.price * item.quantity;
      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price
      });
    }

    // Create Order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalPrice,
      shippingAddress,
      paymentIntentId,
      paymentStatus: paymentIntentId ? 'paid' : 'unpaid'
    });

    await order.save();

    // Reduce Product stock by quantity using bulkWrite for efficiency
    const bulkOps = cart.items.map(item => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { stock: -item.quantity } }
      }
    }));
    await Product.bulkWrite(bulkOps);

    // Clear the cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({ order });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Server error creating order' });
  }
});

// GET /api/orders/my-orders
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.status(200).json({ order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.status(500).json({ message: 'Server error fetching order details' });
  }
});

module.exports = router;
