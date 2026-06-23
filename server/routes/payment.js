const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/payment/create-intent
router.post('/create-intent', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ message: 'Amount in paise is required and must be a number' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      metadata: { userId: req.user.id }
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error.message);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
