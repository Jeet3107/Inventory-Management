const Category = require('../models/Category');
const Product = require('../models/Product');

const WASHER_TYPES = ['1/4"', '5/16"', '3/8"', '1/2"', '5/8"', '3/4"', '1"', '1-1/4"', '1-1/2"'];
const ANCHOR_TYPES = ['Routh', 'SKT', 'Bricks', 'Company', 'Stud'];

const DEFAULT_CATEGORIES = [
  { name: 'Washer', description: 'Washer inventory measured in kg bags.' },
  { name: 'Anchor', description: 'Anchor inventory measured in nos.' },
  { name: 'Patta', description: 'Patta inventory measured in kg bags.' },
];

const sanitizeSkuPart = (value) =>
  String(value || 'ITEM')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 16) || 'ITEM';

const categoryDefaults = {
  washer: { unit: 'kg', packSize: 50 },
  anchor: { unit: 'nos', packSize: 100 },
  patta: { unit: 'kg', packSize: 50 },
};

const ensureDefaultInventory = async (userId) => {
  const categoryMap = {};

  await Promise.all(
    DEFAULT_CATEGORIES.map(async (category) => {
      const doc = await Category.findOneAndUpdate(
        { createdBy: userId, name: category.name },
        { $setOnInsert: { ...category, createdBy: userId } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      categoryMap[category.name.toLowerCase()] = doc;
    }),
  );

  const defaults = [
    ...WASHER_TYPES.map((size) => ({ type: 'washer', size, name: `Washer ${size}` })),
    ...ANCHOR_TYPES.map((size) => ({ type: 'anchor', size, name: `Anchor ${size}` })),
    { type: 'patta', size: 'Custom', name: 'Patta' },
  ];

  await Promise.all(
    defaults.map((item) => {
      const typeDefaults = categoryDefaults[item.type];
      const category = categoryMap[item.type];
      return Product.updateOne(
        { createdBy: userId, type: item.type, size: item.size },
        {
          $setOnInsert: {
            name: item.name,
            sku: `${sanitizeSkuPart(item.type)}-${sanitizeSkuPart(item.size)}-${sanitizeSkuPart(userId).slice(0, 6)}`,
            category: category._id,
            type: item.type,
            size: item.size,
            unit: typeDefaults.unit,
            packSize: typeDefaults.packSize,
            quantity: 0,
            lowStockThreshold: item.type === 'anchor' ? 100 : 50,
            status: 'active',
            createdBy: userId,
          },
        },
        { upsert: true },
      );
    }),
  );
};

module.exports = { ensureDefaultInventory };
