const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  imageUrl: {
    type: String
  },
  stock: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for average rating calculation
productSchema.virtual('avgRating').get(function() {
  if (!this.ratings || this.ratings.length === 0) {
    return 0;
  }
  const total = this.ratings.reduce((sum, rating) => sum + rating.value, 0);
  return total / this.ratings.length;
});

module.exports = mongoose.model('Product', productSchema);
