const express = require('express');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const filter = {};

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    // Filter by price range if provided
    if (minPrice !== undefined && minPrice !== '') {
      filter.price = filter.price || {};
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      filter.price = filter.price || {};
      filter.price.$lte = Number(maxPrice);
    }

    // Filter by text search if provided
    if (search) {
      filter.$text = { $search: search };
    }

    // Fetch matching count and paginated items
    const totalCount = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      products,
      totalCount,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Server error fetching products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(500).json({ message: 'Server error fetching product' });
  }
});

// POST /api/products (Admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Admin role check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, price, category, description, imageUrl, stock } = req.body;

    // Validate required fields
    if (!name || price === undefined || !category) {
      return res.status(422).json({ message: 'Name, price, and category are required' });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      stock
    });

    await product.save();
    return res.status(201).json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Server error creating product' });
  }
});

// PUT /api/products/:id (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Admin role check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(500).json({ message: 'Server error updating product' });
  }
});

// DELETE /api/products/:id (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Admin role check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(500).json({ message: 'Server error deleting product' });
  }
});

module.exports = router;
