import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { productAPI, categoryAPI } from '../utils/api';
import ProductModal from '../components/products/ProductModal';
import StockModal from '../components/products/StockModal';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.getAll({ search, category: filterCategory, status: filterStatus, page, limit: 10 });
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterStatus, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoryAPI.getAll().then(({ data }) => setCategories(data)); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Delete failed'); }
  };

  const openEdit = (product) => { setSelectedProduct(product); setShowModal(true); };
  const openStock = (product) => { setSelectedProduct(product); setShowStockModal(true); };
  const openCreate = () => { setSelectedProduct(null); setShowModal(true); };

  const statusBadge = (s) => {
    const map = { active: 'badge-success', inactive: 'badge-warning', discontinued: 'badge-danger' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="card mb-4">
        <div className="filters">
          <input className="form-control" placeholder="Search products..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="form-control" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="form-control" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th><th>Name</th><th>Category</th>
                  <th>Price</th><th>Cost</th><th>Stock</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="10" className="text-center text-muted" style={{ padding: 30 }}>No products found</td></tr>
                ) : products.map((p) => (
                  <tr key={p._id}>
                    <td data-label="SKU"><code>{p.sku}</code></td>
                    <td data-label="Name">
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      {p.isLowStock && <span className="badge badge-danger" style={{ fontSize: 11 }}>Low Stock</span>}
                    </td>
                    <td data-label="Type" style={{ textTransform: 'capitalize' }}>{p.type}</td>
                    <td data-label="Size">{p.size || '-'}</td>
                    <td data-label="Unit">{p.unit}</td>
                    <td data-label="Price">₹{p.price?.toLocaleString()}</td>
                    <td data-label="Cost">₹{p.costPrice?.toLocaleString()}</td>
                    <td data-label="Stock">
                      <span style={{ fontWeight: 600, color: p.quantity <= p.lowStockThreshold ? '#ef4444' : '#22c55e' }}>
                        {p.quantity}
                      </span>
                    </td>
                    <td data-label="Status">{statusBadge(p.status)}</td>
                    <td data-label="Actions">
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-secondary" onClick={() => openStock(p)}>📦 Stock</button>
                        <button className="btn btn-sm btn-primary" onClick={() => openEdit(p)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-sm btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <button className="btn btn-sm btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchProducts(); }}
        />
      )}
      {showStockModal && (
        <StockModal
          product={selectedProduct}
          onClose={() => setShowStockModal(false)}
          onSaved={() => { setShowStockModal(false); fetchProducts(); }}
        />
      )}
    </div>
  );
};

export default ProductsPage;
