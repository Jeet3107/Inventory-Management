const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    type: { type: String, enum: ['washer', 'anchor', 'patta', 'other'], default: 'washer' },
    size: { type: String, trim: true, default: '' },
    unit: { type: String, enum: ['kg', 'nos', 'pcs', 'bag', 'meter'], default: 'kg' },
    packSize: { type: Number, default: 50, min: 0 },
    price: { type: Number, default: null, min: 0 },
    costPrice: { type: Number, default: null, min: 0 },
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
  if (!this.price || this.price <= 0 || this.costPrice == null) return null;
  return (((this.price - this.costPrice) / this.price) * 100).toFixed(2);
});

productSchema.index({ createdBy: 1, createdAt: -1 });
productSchema.index({ createdBy: 1, status: 1 });
productSchema.index({ createdBy: 1, category: 1, status: 1 });

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
