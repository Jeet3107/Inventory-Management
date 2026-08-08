import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { productAPI } from '../../utils/api';
import './Modal.css';

const ProductModal = ({ product, categories, onClose, onSaved }) => {
  const [form, setForm] = useState(product ? {
    name: product.name, sku: product.sku, description: product.description,
    category: product.category?._id || '', price: product.price, costPrice: product.costPrice,
    quantity: product.quantity, lowStockThreshold: product.lowStockThreshold,
    supplier: product.supplier, status: product.status,
  } : {
    name: '', sku: '', description: '', category: '', price: '', costPrice: '',
    quantity: 0, lowStockThreshold: 10, supplier: '', status: 'active',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) await productAPI.update(product._id, form);
      else await productAPI.create(form);
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
              <label>SKU *</label>
              <input className="form-control" name="sku" value={form.sku} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select className="form-control" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Selling Price (₹) *</label>
              <input className="form-control" type="number" name="price" value={form.price} onChange={handleChange} required min="0" />
            </div>
            <div className="form-group">
              <label>Cost Price (₹) *</label>
              <input className="form-control" type="number" name="costPrice" value={form.costPrice} onChange={handleChange} required min="0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input className="form-control" type="number" name="quantity" value={form.quantity} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label>Low Stock Threshold</label>
              <input className="form-control" type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Supplier</label>
              <input className="form-control" name="supplier" value={form.supplier} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
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
