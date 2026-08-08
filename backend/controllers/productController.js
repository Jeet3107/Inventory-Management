const Product = require('../models/Product');

// GET all products
const getProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;
    const query = { createdBy: req.user._id };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
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
    const product = await Product.create({ ...req.body, createdBy: req.user._id });
    await product.populate('category', 'name');
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
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
    const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (operation === 'add') product.quantity += quantity;
    else if (operation === 'subtract') product.quantity = Math.max(0, product.quantity - quantity);
    else product.quantity = quantity;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStock };
