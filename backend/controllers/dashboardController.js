const Product = require('../models/Product');
const Category = require('../models/Category');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalProducts = await Product.countDocuments({ createdBy: userId });
    const activeProducts = await Product.countDocuments({ status: 'active', createdBy: userId });
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      status: 'active',
      createdBy: userId,
    }).populate('category', 'name').limit(10);

    const totalCategories = await Category.countDocuments({ createdBy: userId });

    const inventoryValue = await Product.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$costPrice'] } } } },
    ]);

    const categoryBreakdown = await Product.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$quantity' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', count: 1, totalStock: 1 } },
    ]);

    res.json({
      totalProducts,
      activeProducts,
      totalCategories,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      inventoryValue: inventoryValue[0]?.total || 0,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats };
