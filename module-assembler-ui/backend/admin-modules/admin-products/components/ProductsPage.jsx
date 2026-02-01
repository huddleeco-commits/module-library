/**
 * Products Management Page
 * Manages product catalog, inventory, and pricing
 */
import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, Filter, DollarSign, Archive } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated product data
    setProducts([
      { id: 1, name: 'Product 1', price: 29.99, stock: 50, category: 'Category A', status: 'active' },
      { id: 2, name: 'Product 2', price: 49.99, stock: 25, category: 'Category B', status: 'active' },
      { id: 3, name: 'Product 3', price: 19.99, stock: 0, category: 'Category A', status: 'out_of_stock' },
    ]);
    setLoading(false);
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Products</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage your product catalog</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#6366f1', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
        }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 10px 10px 40px',
              border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px'
            }}
          />
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '8px', cursor: 'pointer', color: '#475569'
        }}>
          <Filter size={16} /> Filter
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Product</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Price</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Stock</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Category</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} style={{ color: '#94a3b8' }} />
                    </div>
                    <span style={{ fontWeight: '500', color: '#1a1a2e' }}>{product.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>${product.price.toFixed(2)}</td>
                <td style={{ padding: '14px 16px', color: product.stock === 0 ? '#ef4444' : '#475569' }}>{product.stock}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{product.category}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                    background: product.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: product.status === 'active' ? '#16a34a' : '#dc2626'
                  }}>
                    {product.status === 'active' ? 'Active' : 'Out of Stock'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginRight: '4px' }}>
                    <Edit size={16} />
                  </button>
                  <button style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
