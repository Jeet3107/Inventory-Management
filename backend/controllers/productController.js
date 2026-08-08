const Product = require('../models/Product');
const { ensureDefaultInventory } = require('../utils/defaultInventory');

const sanitizeSkuPart = (value) =>
  String(value || 'ITEM')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 12) || 'ITEM';

const normalizeOptionalNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  return Number(value);
};

const buildProductPayload = (body, userId, existingProduct) => {
  const payload = { ...body };
  const type = payload.type || existingProduct?.type || 'washer';

  payload.type = type;
  payload.price = normalizeOptionalNumber(payload.price);
  payload.costPrice = normalizeOptionalNumber(payload.costPrice);
  payload.quantity = payload.quantity === '' || payload.quantity == null ? 0 : Number(payload.quantity);
  payload.lowStockThreshold =
    payload.lowStockThreshold === '' || payload.lowStockThreshold == null ? 10 : Number(payload.lowStockThreshold);
  payload.packSize = payload.packSize === '' || payload.packSize == null ? (type === 'anchor' ? 100 : 50) : Number(payload.packSize);
  payload.unit = payload.unit || (type === 'anchor' ? 'nos' : 'kg');
  payload.size = payload.size || '';
  payload.supplier = payload.supplier || '';
  payload.description = payload.description || '';

  if (payload.sku && payload.sku.trim()) {
    payload.sku = payload.sku.trim().toUpperCase();
  } else if (!existingProduct) {
    payload.sku = `${sanitizeSkuPart(type)}-${Date.now().toString(36).toUpperCase()}-${sanitizeSkuPart(userId).slice(0, 4)}`;
  } else {
    delete payload.sku;
  }

  return payload;
};

// GET all products
const getProducts = async (req, res) => {
  try {
    await ensureDefaultInventory(req.user._id);
    const { search, category, status, page = 1, limit = 10 } = req.query;
    const query = { createdBy: req.user._id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { size: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .select('name sku category type size unit packSize price costPrice quantity lowStockThreshold status createdAt')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
    ]);

    res.json({ products, total, page: pageNumber, pages: Math.ceil(total / limitNumber) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id }).populate('category', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create product
const createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...buildProductPayload(req.body, req.user._id), createdBy: req.user._id });
    await product.populate('category', 'name');
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update product
const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      buildProductPayload(req.body, req.user._id, existingProduct),
      { new: true, runValidators: true }
    ).populate('category', 'name');
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH update stock
const updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' | 'subtract' | 'set'
    const stockQuantity = Number(quantity);
    const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (operation === 'add') product.quantity += stockQuantity;
    else if (operation === 'subtract') product.quantity = Math.max(0, product.quantity - stockQuantity);
    else product.quantity = stockQuantity;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStock };
