const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import real routers
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const paymentRouter = require('./routes/payment');

const app = express();

// CORS configuration (allow http://localhost:5173 and process.env.CLIENT_URL)
const allowedOrigins = ['http://localhost:5173'];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parser middleware
app.use(express.json());

// Connect to MongoDB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
    });
} else {
  console.warn('Warning: MONGO_URI is not defined in the environment variables.');
}

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);

// Default root route
app.get('/', (req, res) => {
  res.json({ message: 'ShopWave Server API is running' });
});

// Listen on process.env.PORT or 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
