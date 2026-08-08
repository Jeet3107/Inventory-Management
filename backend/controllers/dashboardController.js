const Product = require('../models/Product');
const Category = require('../models/Category');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalCategories,
      inventoryValue,
      categoryBreakdown,
    ] = await Promise.all([
      Product.countDocuments({ createdBy: userId }),
      Product.countDocuments({ status: 'active', createdBy: userId }),
      Product.find({
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
        status: 'active',
        createdBy: userId,
      })
        .select('name category quantity unit lowStockThreshold')
        .populate('category', 'name')
        .limit(10),
      Category.countDocuments({ createdBy: userId }),
      Product.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', { $ifNull: ['$costPrice', 0] }] } } } },
      ]),
      Product.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$quantity' } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { name: '$category.name', count: 1, totalStock: 1 } },
      ]),
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
