import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { categoryAPI } from "../utils/api";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await categoryAPI.getAll();
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await categoryAPI.update(editing._id, form);
        toast.success("Category updated!");
        setEditing(null);
      } else {
        await categoryAPI.create(form);
        toast.success("Category created!");
      }
      setForm({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description });
  };
  const handleCancel = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await categoryAPI.delete(id);
      toast.success("Deleted!");
      fetchCategories();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>
        Categories
      </h1>
      <div className="categories-layout">
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
            {editing ? "✏️ Edit Category" : "➕ New Category"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                value={form.description}
                rows={3}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center text-muted"
                        style={{ padding: 30 }}
                      >
                        No categories yet
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c._id}>
                        <td data-label="Name" style={{ fontWeight: 500 }}>
                          {c.name}
                        </td>
                        <td
                          data-label="Description"
                          className="text-muted text-sm"
                        >
                          {c.description || "—"}
                        </td>
                        <td data-label="Actions">
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleEdit(c)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(c._id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
