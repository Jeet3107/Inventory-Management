import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { productAPI } from '../../utils/api';
import './Modal.css';

const StockModal = ({ product, onClose, onSaved }) => {
  const [operation, setOperation] = useState('add');
  const [bags, setBags] = useState('');
  const [looseQuantity, setLooseQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const unit = product.unit || 'units';
  const packSize = Number(product.packSize || 0);
  const totalQuantity = Number(((Number(bags || 0) * packSize) + Number(looseQuantity || 0)).toFixed(2));
  const packText = product.packSize
    ? unit === 'nos' || unit === 'pcs'
      ? `${product.packSize} ${unit}/bag`
      : `${product.packSize} kg/bag`
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalQuantity <= 0) {
      toast.error('Enter bags or loose quantity');
      return;
    }
    setLoading(true);
    try {
      await productAPI.updateStock(product._id, { quantity: totalQuantity, operation });
      toast.success('Stock updated!');
      onSaved();
    } catch (err) {
      toast.error('Stock update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Stock</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="stock-info">
            <strong>{product.name}</strong>
            <span>Current: <b>{product.quantity}</b> {unit}</span>
          </div>
          {packText && <div className="field-hint stock-hint">Pack size: {packText}</div>}
          <div className="form-group">
            <label>Operation</label>
            <select className="form-control" value={operation} onChange={(e) => setOperation(e.target.value)}>
              <option value="add">➕ Add Stock</option>
              <option value="subtract">➖ Remove Stock</option>
              <option value="set">🔄 Set Stock</option>
            </select>
          </div>
          <div className="form-group">
            <label>Bags</label>
            <input className="form-control" type="number" value={bags}
              onChange={(e) => setBags(e.target.value)} min="0" placeholder="e.g. 2" />
          </div>
          <div className="form-group">
            <label>{unit === 'nos' || unit === 'pcs' ? 'Loose Pieces' : 'Loose / Chutak'} ({unit})</label>
            <input className="form-control" type="number" value={looseQuantity}
              onChange={(e) => setLooseQuantity(e.target.value)} min="0" placeholder="e.g. 25" />
          </div>
          <div className="stock-total">Total: {totalQuantity} {unit}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockModal;
