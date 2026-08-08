import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { dashboardAPI } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './DashboardPage.css';

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="stat-icon" style={{ background: color + '20' }}>{icon}</div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

const DEFAULT_STATS = {
  totalProducts: 0,
  activeProducts: 0,
  totalCategories: 0,
  lowStockCount: 0,
  lowStockProducts: [],
  inventoryValue: 0,
  categoryBreakdown: [],
};

const DashboardPage = () => {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await dashboardAPI.getStats();
      setStats({ ...DEFAULT_STATS, ...data });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load dashboard stats';
      setError(message);
      setStats(DEFAULT_STATS);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      {error && (
        <div className="dashboard-error">
          <div>
            <strong>Dashboard data could not be loaded.</strong>
            <p>{error}</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchStats}>Retry</button>
        </div>
      )}

      <div className="stats-grid">
        <StatCard icon="📦" label="Total Products" value={stats.totalProducts} color="#4f46e5" />
        <StatCard icon="✅" label="Active Products" value={stats.activeProducts} color="#22c55e" />
        <StatCard icon="🏷️" label="Categories" value={stats.totalCategories} color="#f59e0b" />
        <StatCard icon="⚠️" label="Low Stock" value={stats.lowStockCount} color="#ef4444" />
        <StatCard icon="💰" label="Inventory Value" value={`₹${stats.inventoryValue?.toLocaleString()}`} color="#06b6d4" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 className="section-title">Stock by Category</h3>
          {stats.categoryBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.categoryBreakdown}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="totalStock" radius={[4, 4, 0, 0]}>
                  {stats.categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted text-center mt-4">No data yet</p>}
        </div>

        <div className="card">
          <h3 className="section-title">⚠️ Low Stock Alerts</h3>
          {stats.lowStockProducts?.length > 0 ? (
            <div className="low-stock-list">
              {stats.lowStockProducts.map((p) => (
                <div key={p._id} className="low-stock-item">
                  <div>
                    <div className="product-name">{p.name}</div>
                    <div className="text-sm text-muted">{p.category?.name}</div>
                  </div>
                  <span className="badge badge-danger">{p.quantity} left</span>
                </div>
              ))}
            </div>
          ) : <p className="text-muted text-center mt-4">All products are well-stocked ✅</p>}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
