const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    supplier: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive', 'discontinued'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

productSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

productSchema.virtual('profitMargin').get(function () {
  return (((this.price - this.costPrice) / this.price) * 100).toFixed(2);
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
