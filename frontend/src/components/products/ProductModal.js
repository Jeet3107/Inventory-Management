import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { productAPI } from '../../utils/api';
import './Modal.css';

const WASHER_TYPES = ['1/4"', '5/16"', '3/8"', '1/2"', '5/8"', '3/4"', '1"', '1-1/4"', '1-1/2"'];
const ANCHOR_TYPES = ['Routh', 'SKT', 'Bricks', 'Company', 'Stud'];
const PRODUCT_DEFAULTS = {
  washer: { unit: 'kg', packSize: 50, label: 'Washer Size', options: WASHER_TYPES },
  anchor: { unit: 'nos', packSize: 100, label: 'Anchor Type', options: ANCHOR_TYPES },
  patta: { unit: 'kg', packSize: 50, label: 'Patta Size', options: null },
  other: { unit: 'kg', packSize: 50, label: 'Type / Size', options: null },
};

const detectProductType = (categoryName = '') => {
  const name = categoryName.toLowerCase();
  if (name.includes('anchor')) return 'anchor';
  if (name.includes('patta')) return 'patta';
  if (name.includes('washer')) return 'washer';
  return 'other';
};

const ProductModal = ({ product, categories, onClose, onSaved }) => {
  const initialCategory = product?.category?._id || '';
  const initialCategoryName = categories.find((c) => c._id === initialCategory)?.name || product?.category?.name || '';
  const initialType = product?.type || detectProductType(initialCategoryName);

  const [form, setForm] = useState(product ? {
    name: product.name || '', sku: product.sku || '', description: product.description || '',
    category: initialCategory, type: initialType, size: product.size || '',
    unit: product.unit || PRODUCT_DEFAULTS[initialType].unit,
    packSize: product.packSize ?? PRODUCT_DEFAULTS[initialType].packSize,
    price: product.price ?? '', costPrice: product.costPrice ?? '',
    quantity: product.quantity ?? 0, lowStockThreshold: product.lowStockThreshold ?? 10,
    supplier: product.supplier || '', status: product.status || 'active',
  } : {
    name: '', sku: '', description: '', category: '', type: 'washer', size: WASHER_TYPES[0],
    unit: 'kg', packSize: 50, price: '', costPrice: '',
    quantity: 0, lowStockThreshold: 10, supplier: '', status: 'active',
  });
  const [loading, setLoading] = useState(false);

  const activeDefaults = PRODUCT_DEFAULTS[form.type] || PRODUCT_DEFAULTS.other;

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const categoryName = categories.find((c) => c._id === categoryId)?.name || '';
    const nextType = detectProductType(categoryName);
    const defaults = PRODUCT_DEFAULTS[nextType] || PRODUCT_DEFAULTS.other;
    setForm({
      ...form,
      category: categoryId,
      type: nextType,
      unit: defaults.unit,
      packSize: defaults.packSize,
      size: defaults.options ? defaults.options[0] : '',
    });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const buildPayload = () => ({
    ...form,
    sku: form.sku.trim(),
    size: form.size.trim(),
    price: form.price === '' ? null : Number(form.price),
    costPrice: form.costPrice === '' ? null : Number(form.costPrice),
    quantity: Number(form.quantity || 0),
    lowStockThreshold: Number(form.lowStockThreshold || 0),
    packSize: Number(form.packSize || 0),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildPayload();
      if (product) await productAPI.update(product._id, payload);
      else await productAPI.create(payload);
      toast.success(product ? 'Product updated!' : 'Product created!');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add Product'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input className="form-control" name="sku" value={form.sku} onChange={handleChange} placeholder="Auto if blank" />
            </div>
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select className="form-control" name="category" value={form.category} onChange={handleCategoryChange} required>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <div className="field-hint">Use category names like Washer, Anchor, Patta to apply correct defaults.</div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{activeDefaults.label} *</label>
              {activeDefaults.options ? (
                <select className="form-control" name="size" value={form.size} onChange={handleChange} required>
                  {activeDefaults.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input className="form-control" name="size" value={form.size} onChange={handleChange} placeholder="e.g. 2 inch x 3mm" required />
              )}
            </div>
            <div className="form-group">
              <label>Unit *</label>
              <select className="form-control" name="unit" value={form.unit} onChange={handleChange} required>
                <option value="kg">kg</option>
                <option value="nos">nos</option>
                <option value="pcs">pcs</option>
                <option value="bag">bag</option>
                <option value="meter">meter</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{form.unit === 'nos' || form.unit === 'pcs' ? 'Pcs per Bag' : 'Bag Weight (kg)'}</label>
              <input className="form-control" type="number" name="packSize" value={form.packSize} onChange={handleChange} min="0" />
              <div className="field-hint">Default: Washer/Patta 50 kg, Anchor 100 nos. Editable.</div>
            </div>
            <div className="form-group">
              <label>Opening Stock ({form.unit})</label>
              <input className="form-control" type="number" name="quantity" value={form.quantity} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Selling Price (₹) optional</label>
              <input className="form-control" type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" placeholder="Can add later" />
            </div>
            <div className="form-group">
              <label>Cost Price (₹) optional</label>
              <input className="form-control" type="number" name="costPrice" value={form.costPrice} onChange={handleChange} min="0" step="0.01" placeholder="Can add later" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Low Stock Threshold ({form.unit})</label>
              <input className="form-control" type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <input className="form-control" name="supplier" value={form.supplier} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
