/**
 * Menu Editor Component
 *
 * Visual editor for managing restaurant menu with:
 * - Drag-drop reordering
 * - Inline price editing
 * - Availability toggles
 * - Dietary flag management
 * - Category management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, GripVertical, Check, X, ChevronDown, ChevronRight,
  Leaf, Wheat, Milk, Star, Eye, EyeOff, Save, RefreshCw, AlertCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api/admin';

// Dietary flag icons
const DIETARY_FLAGS = {
  vegetarian: { icon: Leaf, label: 'Vegetarian', color: 'text-green-600' },
  vegan: { icon: Leaf, label: 'Vegan', color: 'text-green-700' },
  gluten_free: { icon: Wheat, label: 'Gluten Free', color: 'text-amber-600' },
  dairy_free: { icon: Milk, label: 'Dairy Free', color: 'text-blue-500' }
};

// Menu Item Component
function MenuItem({ item, onUpdate, onDelete, onToggleAvailable }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(item);

  const handleSave = async () => {
    await onUpdate(item.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(item);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-amber-400 rounded-lg p-4 shadow-md">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={editData.price}
                onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Flags</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(DIETARY_FLAGS).map(([key, { icon: Icon, label }]) => (
              <button
                key={key}
                onClick={() => setEditData({
                  ...editData,
                  dietary_flags: {
                    ...editData.dietary_flags,
                    [key]: !editData.dietary_flags?.[key]
                  }
                })}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                  editData.dietary_flags?.[key]
                    ? 'bg-green-100 text-green-800 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editData.popular}
              onChange={(e) => setEditData({ ...editData, popular: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
            />
            <Star size={16} className="text-amber-500" />
            <span className="text-sm">Mark as Popular</span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg p-4 flex items-center gap-4 group hover:shadow-md transition-shadow ${
      !item.available ? 'opacity-60' : ''
    }`}>
      <div className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={20} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">{item.name}</h4>
          {item.popular && <Star size={14} className="text-amber-500 fill-amber-500" />}
          {Object.entries(item.dietary_flags || {}).map(([key, value]) => {
            if (!value) return null;
            const flag = DIETARY_FLAGS[key];
            if (!flag) return null;
            const Icon = flag.icon;
            return (
              <span key={key} title={flag.label}>
                <Icon size={14} className={flag.color} />
              </span>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 truncate max-w-md">{item.description}</p>
      </div>

      <div className="text-lg font-semibold text-gray-900">
        ${item.price.toFixed(2)}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleAvailable(item.id, !item.available)}
          className={`p-2 rounded-lg transition-colors ${
            item.available
              ? 'text-green-600 hover:bg-green-50'
              : 'text-red-500 hover:bg-red-50'
          }`}
          title={item.available ? 'Mark unavailable' : 'Mark available'}
        >
          {item.available ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit item"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

// Category Component
function MenuCategory({ category, items, onUpdateItem, onDeleteItem, onToggleAvailable, onAddItem }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;
    await onAddItem(category.id, newItem);
    setNewItem({ name: '', price: '', description: '' });
    setShowAddForm(false);
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          <span className="text-sm text-gray-500">({items.length} items)</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAddForm(true);
            setIsExpanded(true);
          }}
          className="flex items-center gap-1 px-3 py-1 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {items.map(item => (
            <MenuItem
              key={item.id}
              item={item}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              onToggleAvailable={onToggleAvailable}
            />
          ))}

          {showAddForm && (
            <div className="bg-white border-2 border-dashed border-amber-300 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Description (optional)"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.name || !newItem.price}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>
            </div>
          )}

          {items.length === 0 && !showAddForm && (
            <p className="text-gray-400 text-center py-4">No items in this category</p>
          )}
        </div>
      )}
    </div>
  );
}

// Main Menu Editor Component
export function MenuEditor() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch menu data
  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/menu`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(data.error || 'Failed to load menu');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to SSE updates
  useEffect(() => {
    fetchMenu();

    const eventSource = new EventSource(`${API_BASE.replace('/admin', '')}/events/menu`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== 'connected' && data.type !== 'initial_state') {
        // Refresh on any menu update
        fetchMenu();
      }
    };

    eventSource.onerror = () => {
      console.warn('SSE connection lost, will retry...');
    };

    return () => eventSource.close();
  }, [fetchMenu]);

  // Update item
  const handleUpdateItem = async (itemId, updates) => {
    try {
      const res = await fetch(`${API_BASE}/menu/item/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to update item');
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`${API_BASE}/menu/item/${itemId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  // Toggle availability
  const handleToggleAvailable = async (itemId, available) => {
    try {
      const res = await fetch(`${API_BASE}/menu/item/${itemId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to update availability');
    }
  };

  // Add item
  const handleAddItem = async (categoryId, item) => {
    try {
      const res = await fetch(`${API_BASE}/menu/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, category_id: categoryId })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to add item');
    }
  };

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.name) return;
    try {
      const res = await fetch(`${API_BASE}/menu/category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      const data = await res.json();
      if (data.success) {
        setNewCategory({ name: '', description: '' });
        setShowAddCategory(false);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to add category');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Editor</h1>
          {lastUpdate && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchMenu}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Add Category Form */}
      {showAddCategory && (
        <div className="mb-6 p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl">
          <h3 className="font-medium text-gray-900 mb-4">New Category</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddCategory(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.name}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              Create Category
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {categories.map(category => (
          <MenuCategory
            key={category.id}
            category={category}
            items={category.items || []}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onToggleAvailable={handleToggleAvailable}
            onAddItem={handleAddItem}
          />
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No menu categories yet</p>
            <button
              onClick={() => setShowAddCategory(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              <Plus size={18} />
              Create your first category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuEditor;
