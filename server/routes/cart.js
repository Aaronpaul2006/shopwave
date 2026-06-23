const express = require('express');
const Cart = require('../models/Cart');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price imageUrl');
    if (!cart) {
      return res.status(200).json({ cart: { items: [] } });
    }
    return res.status(200).json({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// POST /api/cart/add
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl');

    return res.status(200).json({ cart });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({ message: 'Server error adding item to cart' });
  }
});

// PUT /api/cart/update
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const qty = parseInt(quantity);
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      if (qty <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = qty;
      }
      
      await cart.save();
      await cart.populate('items.product', 'name price imageUrl');
      
      return res.status(200).json({ cart });
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ message: 'Server error updating cart' });
  }
});

// DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product', 'name price imageUrl');

    return res.status(200).json({ cart });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return res.status(500).json({ message: 'Server error removing item from cart' });
  }
});

// DELETE /api/cart/clear
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({ message: 'Server error clearing cart' });
  }
});

module.exports = router;
