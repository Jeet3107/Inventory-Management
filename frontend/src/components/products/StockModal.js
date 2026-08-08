import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { productAPI } from '../../utils/api';
import './Modal.css';

const StockModal = ({ product, onClose, onSaved }) => {
  const [operation, setOperation] = useState('add');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productAPI.updateStock(product._id, { quantity: Number(quantity), operation });
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
            <span>Current: <b>{product.quantity}</b> units</span>
          </div>
          <div className="form-group">
            <label>Operation</label>
            <select className="form-control" value={operation} onChange={(e) => setOperation(e.target.value)}>
              <option value="add">➕ Add Stock</option>
              <option value="subtract">➖ Remove Stock</option>
              <option value="set">🔄 Set Stock</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input className="form-control" type="number" value={quantity}
              onChange={(e) => setQuantity(e.target.value)} min="0" required />
          </div>
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
