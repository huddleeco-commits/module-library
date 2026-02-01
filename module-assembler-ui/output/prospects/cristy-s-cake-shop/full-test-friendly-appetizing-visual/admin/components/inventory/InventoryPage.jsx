/**
 * InventoryPage
 * 
 * Complete inventory management dashboard.
 * - View all inventory items
 * - Stock levels and alerts
 * - Quick reorder
 * - Category filtering
 * - Supplier info
 * - Cost tracking
 * 
 * Works for any industry: restaurant ingredients, retail products,
 * salon supplies, medical equipment, etc.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit2,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Truck,
  DollarSign,
  BarChart3,
  RefreshCw,
  Archive,
  Tag
} from 'lucide-react';

export function InventoryPage() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 20;

  const [categories, setCategories] = useState([
    { id: 'all', label: 'All Items', count: 0 }
  ]);
  const [error, setError] = useState(null);

  // Fetch inventory from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch inventory and categories in parallel
      const [inventoryRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/inventory?category=${activeCategory !== 'all' ? activeCategory : ''}&search=${searchQuery}&lowStock=${stockFilter === 'low'}`),
        fetch('/api/admin/inventory/categories')
      ]);

      let items = [];
      let cats = [];

      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        items = (data.items || data || []).map(item => ({
          id: item.id || `INV-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name || 'Unknown Item',
          sku: item.sku || '',
          category: item.category || 'general',
          currentStock: item.quantity || 0,
          unit: item.unit || 'units',
          minStock: item.low_stock_threshold || 10,
          maxStock: item.max_stock || 100,
          reorderPoint: item.low_stock_threshold || 10,
          reorderQuantity: item.reorder_quantity || 20,
          costPerUnit: parseFloat(item.cost) || 0,
          lastCost: parseFloat(item.cost) || 0,
          supplier: { id: item.supplier_id || '', name: item.supplier_name || 'Unknown' },
          location: item.location || 'Storage',
          lastRestocked: item.updated_at ? new Date(item.updated_at) : null,
          expirationDate: item.expiration_date ? new Date(item.expiration_date) : null,
          status: getStockStatus(item.quantity, item.low_stock_threshold),
          usageRate: item.usage_rate || 0,
          daysUntilEmpty: item.quantity > 0 && item.usage_rate > 0 ? Math.floor(item.quantity / item.usage_rate) : 0
        }));
      }

      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        cats = [
          { id: 'all', label: 'All Items', count: items.length },
          ...(catData || []).map(c => ({
            id: c.category || 'unknown',
            label: (c.category || 'Unknown').charAt(0).toUpperCase() + (c.category || 'unknown').slice(1).replace('_', ' '),
            count: parseInt(c.count) || 0
          }))
        ];
      } else {
        // Calculate categories from items if endpoint fails
        const catCounts = {};
        items.forEach(item => {
          catCounts[item.category] = (catCounts[item.category] || 0) + 1;
        });
        cats = [
          { id: 'all', label: 'All Items', count: items.length },
          ...Object.entries(catCounts).map(([cat, count]) => ({
            id: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
            count
          }))
        ];
      }

      setInventory(items);
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine stock status
  const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) return 'out';
    if (quantity < threshold * 0.5) return 'critical';
    if (quantity < threshold) return 'low';
    if (quantity <= threshold * 1.2) return 'reorder';
    return 'ok';
  };

  useEffect(() => {
    fetchInventory();
  }, [activeCategory, stockFilter]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'ok':
        return { label: 'In Stock', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle };
      case 'low':
        return { label: 'Low Stock', color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', icon: AlertTriangle };
      case 'critical':
        return { label: 'Critical', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', icon: AlertCircle };
      case 'reorder':
        return { label: 'Reorder', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: ShoppingCart };
      case 'out':
        return { label: 'Out of Stock', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: AlertCircle };
      default:
        return { label: status, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', icon: Package };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleQuickReorder = (item) => {
    console.log('Quick reorder:', item.id, item.reorderQuantity);
    // Would open supplier integration or create PO
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventory.map(i => i.id));
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (stockFilter === 'low' && !['low', 'critical', 'reorder'].includes(item.status)) return false;
    if (stockFilter === 'out' && item.status !== 'out') return false;
    if (stockFilter === 'ok' && item.status !== 'ok') return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(query) ||
             item.sku.toLowerCase().includes(query) ||
             item.supplier.name.toLowerCase().includes(query);
    }
    return true;
  });

  // Sort inventory
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'stock_low': return a.currentStock - b.currentStock;
      case 'stock_high': return b.currentStock - a.currentStock;
      case 'expiring': 
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;
        return a.expirationDate - b.expirationDate;
      case 'value': return (b.currentStock * b.costPerUnit) - (a.currentStock * a.costPerUnit);
      default: return 0;
    }
  });

  // Paginate
  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage);
  const paginatedInventory = sortedInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(i => ['low', 'critical', 'reorder'].includes(i.status)).length,
    outOfStock: inventory.filter(i => i.status === 'out').length,
    totalValue: inventory.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0),
    expiringIn7Days: inventory.filter(i => {
      if (!i.expirationDate) return false;
      const days = Math.floor((i.expirationDate - new Date()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 7;
    }).length
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Inventory</h1>
          <span style={styles.itemCount}>{filteredInventory.length} items</span>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.actionBtn}>
            <Download size={16} />
            Export
          </button>
          <button style={styles.actionBtn}>
            <RefreshCw size={16} />
            Sync
          </button>
          <button style={styles.addButton}>
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Package size={20} color="#3b82f6" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{stats.totalItems}</span>
            <span style={styles.statLabel}>Total Items</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'rgba(234, 179, 8, 0.1)' }}>
            <AlertTriangle size={20} color="#eab308" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{stats.lowStock}</span>
            <span style={styles.statLabel}>Low Stock</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertCircle size={20} color="#ef4444" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{stats.outOfStock}</span>
            <span style={styles.statLabel}>Out of Stock</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
            <DollarSign size={20} color="#22c55e" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{formatCurrency(stats.totalValue)}</span>
            <span style={styles.statLabel}>Inventory Value</span>
          </div>
        </div>
      </div>

      {/* Alerts Banner */}
      {(stats.lowStock > 0 || stats.expiringIn7Days > 0) && (
        <div style={styles.alertsBanner}>
          {stats.lowStock > 0 && (
            <div style={styles.alertItem}>
              <AlertTriangle size={16} color="#eab308" />
              <span><strong>{stats.lowStock}</strong> items need reordering</span>
              <button style={styles.alertAction}>View All</button>
            </div>
          )}
          {stats.expiringIn7Days > 0 && (
            <div style={styles.alertItem}>
              <AlertCircle size={16} color="#f97316" />
              <span><strong>{stats.expiringIn7Days}</strong> items expiring within 7 days</span>
              <button style={styles.alertAction}>View All</button>
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div style={styles.categoryTabs}>
        {categories.map(cat => (
          <button
            key={cat.id}
            style={{
              ...styles.categoryTab,
              ...(activeCategory === cat.id ? styles.categoryTabActive : {})
            }}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
            <span style={styles.categoryCount}>
              {cat.id === 'all' ? inventory.length : inventory.filter(i => i.category === cat.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search items, SKUs, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.toolbarRight}>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Stock Levels</option>
            <option value="ok">In Stock</option>
            <option value="low">Low / Reorder</option>
            <option value="out">Out of Stock</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.sortSelect}
          >
            <option value="name">Name A-Z</option>
            <option value="stock_low">Stock: Low to High</option>
            <option value="stock_high">Stock: High to Low</option>
            <option value="expiring">Expiring Soon</option>
            <option value="value">Highest Value</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredInventory.length && filteredInventory.length > 0}
                  onChange={handleSelectAll}
                  style={styles.checkbox}
                />
              </th>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Cost</th>
              <th style={styles.th}>Supplier</th>
              <th style={styles.th}>Expires</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.map(item => {
              const statusConfig = getStatusConfig(item.status);
              const StatusIcon = statusConfig.icon;
              const costChange = ((item.costPerUnit - item.lastCost) / item.lastCost * 100).toFixed(1);

              return (
                <tr
                  key={item.id}
                  style={{
                    ...styles.tableRow,
                    ...(selectedItems.includes(item.id) ? styles.tableRowSelected : {})
                  }}
                >
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      style={styles.checkbox}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={styles.itemCell}>
                      <span style={styles.itemName}>{item.name}</span>
                      <span style={styles.itemCategory}>{item.category.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.sku}>{item.sku}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.stockCell}>
                      <span style={styles.stockValue}>{item.currentStock}</span>
                      <span style={styles.stockUnit}>{item.unit}</span>
                      {item.daysUntilEmpty > 0 && item.daysUntilEmpty <= 3 && (
                        <span style={styles.daysLeft}>~{item.daysUntilEmpty}d left</span>
                      )}
                    </div>
                    <div style={styles.stockBar}>
                      <div style={{
                        ...styles.stockFill,
                        width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%`,
                        backgroundColor: statusConfig.color
                      }} />
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.color
                    }}>
                      <StatusIcon size={12} />
                      {statusConfig.label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.costCell}>
                      <span style={styles.costValue}>{formatCurrency(item.costPerUnit)}</span>
                      {costChange !== '0.0' && (
                        <span style={{
                          ...styles.costChange,
                          color: parseFloat(costChange) > 0 ? '#ef4444' : '#22c55e'
                        }}>
                          {parseFloat(costChange) > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {Math.abs(parseFloat(costChange))}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.supplier}>{item.supplier.name}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.expiration,
                      color: item.expirationDate && (item.expirationDate - new Date()) < 1000 * 60 * 60 * 24 * 7
                        ? '#f97316'
                        : 'var(--color-text-muted)'
                    }}>
                      {formatDate(item.expirationDate)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionCell}>
                      {['low', 'critical', 'reorder', 'out'].includes(item.status) && (
                        <button
                          style={styles.reorderButton}
                          onClick={() => handleQuickReorder(item)}
                        >
                          <ShoppingCart size={14} />
                          Reorder
                        </button>
                      )}
                      <button
                        style={styles.menuButton}
                        onClick={() => setShowActionMenu(showActionMenu === item.id ? null : item.id)}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {showActionMenu === item.id && (
                        <div style={styles.actionMenu}>
                          <button
                            style={styles.actionMenuItem}
                            onClick={() => navigate(`/inventory/${item.id}`)}
                          >
                            <Eye size={14} /> View Details
                          </button>
                          <button style={styles.actionMenuItem}>
                            <Edit2 size={14} /> Edit Item
                          </button>
                          <button style={styles.actionMenuItem}>
                            <BarChart3 size={14} /> Usage History
                          </button>
                          <button style={styles.actionMenuItem}>
                            <Truck size={14} /> Order History
                          </button>
                          <div style={styles.actionMenuDivider} />
                          <button style={styles.actionMenuItem}>
                            <Archive size={14} /> Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {paginatedInventory.length === 0 && (
          <div style={styles.emptyState}>
            <Package size={48} style={{ opacity: 0.3 }} />
            <h3>No items found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <span style={styles.paginationInfo}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedInventory.length)} of {sortedInventory.length}
          </span>
          <div style={styles.paginationButtons}>
            <button
              style={styles.paginationButton}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === pageNum ? styles.paginationButtonActive : {})
                  }}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              style={styles.paginationButton}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    margin: 0
  },
  itemCount: {
    padding: '6px 12px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '16px',
    fontSize: '13px',
    color: 'var(--color-text-muted)'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    color: 'var(--color-text)',
    fontSize: '14px',
    cursor: 'pointer'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '12px',
    border: '1px solid var(--color-border)'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700
  },
  statLabel: {
    fontSize: '13px',
    color: 'var(--color-text-muted)'
  },
  alertsBanner: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px'
  },
  alertItem: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(234, 179, 8, 0.2)',
    fontSize: '14px'
  },
  alertAction: {
    marginLeft: 'auto',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid currentColor',
    borderRadius: '8px',
    color: '#eab308',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  categoryTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    overflowX: 'auto',
    paddingBottom: '8px'
  },
  categoryTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '20px',
    color: 'var(--color-text)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  },
  categoryTabActive: {
    backgroundColor: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: '#ffffff'
  },
  categoryCount: {
    padding: '2px 8px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    maxWidth: '400px',
    padding: '12px 16px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px'
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text)',
    fontSize: '14px',
    outline: 'none'
  },
  toolbarRight: {
    display: 'flex',
    gap: '12px'
  },
  filterSelect: {
    padding: '12px 16px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    color: 'var(--color-text)',
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none'
  },
  sortSelect: {
    padding: '12px 16px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    color: 'var(--color-text)',
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none'
  },
  tableContainer: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: 'var(--color-surface-2)'
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--color-border)'
  },
  tableRow: {
    borderBottom: '1px solid var(--color-border)',
    transition: 'background-color 0.2s'
  },
  tableRowSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    verticalAlign: 'middle'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  itemCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  itemName: {
    fontWeight: 600
  },
  itemCategory: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    textTransform: 'capitalize'
  },
  sku: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  stockCell: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    marginBottom: '6px'
  },
  stockValue: {
    fontSize: '18px',
    fontWeight: 700
  },
  stockUnit: {
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  daysLeft: {
    fontSize: '11px',
    color: '#f97316',
    fontWeight: 500
  },
  stockBar: {
    width: '80px',
    height: '4px',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  stockFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600
  },
  costCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  costValue: {
    fontWeight: 600
  },
  costChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    fontWeight: 500
  },
  supplier: {
    fontSize: '13px',
    color: 'var(--color-text-muted)'
  },
  expiration: {
    fontSize: '13px'
  },
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-end',
    position: 'relative'
  },
  reorderButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  menuButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    borderRadius: '6px'
  },
  actionMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: '180px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    zIndex: 100,
    overflow: 'hidden'
  },
  actionMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text)',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left'
  },
  actionMenuDivider: {
    height: '1px',
    backgroundColor: 'var(--color-border)',
    margin: '4px 0'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--color-text-muted)'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    padding: '16px 0'
  },
  paginationInfo: {
    fontSize: '14px',
    color: 'var(--color-text-muted)'
  },
  paginationButtons: {
    display: 'flex',
    gap: '8px'
  },
  paginationButton: {
    padding: '8px 14px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-text)',
    fontSize: '14px',
    cursor: 'pointer'
  },
  paginationButtonActive: {
    backgroundColor: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: '#ffffff'
  }
};

export default InventoryPage;