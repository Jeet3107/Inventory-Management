const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

categorySchema.index({ createdBy: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
